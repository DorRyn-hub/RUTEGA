"""Тонкая обёртка над paramiko для деплоя на Beget.

Контекст-менеджер: подключается к SSH по паролю, предоставляет run/put/put_tree/exists.
Стримит stdout/stderr команд в реальный stdout, чтобы прогресс был виден из терминала
или PyCharm Run window.
"""

from __future__ import annotations

import fnmatch
import os
import stat
import sys
from pathlib import Path
from typing import Iterable

import paramiko


class SSHError(RuntimeError):
    pass


class SSHClient:
    def __init__(self, host: str, user: str, password: str, port: int = 22):
        self.host = host
        self.user = user
        self.password = password
        self.port = port
        self._client: paramiko.SSHClient | None = None
        self._sftp: paramiko.SFTPClient | None = None

    def __enter__(self) -> "SSHClient":
        self._connect()
        return self

    def _connect(self) -> None:
        self._client = paramiko.SSHClient()
        self._client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self._client.connect(
            hostname=self.host,
            port=self.port,
            username=self.user,
            password=self.password,
            allow_agent=False,
            look_for_keys=False,
            timeout=30,
            banner_timeout=30,
        )
        transport = self._client.get_transport()
        if transport is not None:
            transport.set_keepalive(15)

    def reconnect(self) -> None:
        if self._sftp is not None:
            try:
                self._sftp.close()
            except Exception:
                pass
            self._sftp = None
        if self._client is not None:
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None
        self._connect()

    def __exit__(self, exc_type, exc, tb) -> None:
        if self._sftp is not None:
            self._sftp.close()
            self._sftp = None
        if self._client is not None:
            self._client.close()
            self._client = None

    @property
    def sftp(self) -> paramiko.SFTPClient:
        if self._sftp is None:
            assert self._client is not None
            self._sftp = self._client.open_sftp()
        return self._sftp

    def run(self, cmd: str, check: bool = True, cwd: str | None = None) -> int:
        assert self._client is not None
        full_cmd = f"cd {cwd} && {cmd}" if cwd else cmd
        print(f"  $ {full_cmd}")
        stdin, stdout, stderr = self._client.exec_command(full_cmd, get_pty=False)
        stdin.close()

        channel = stdout.channel
        while True:
            if channel.recv_ready():
                data = channel.recv(4096).decode("utf-8", errors="replace")
                sys.stdout.write(data)
                sys.stdout.flush()
            if channel.recv_stderr_ready():
                data = channel.recv_stderr(4096).decode("utf-8", errors="replace")
                sys.stderr.write(data)
                sys.stderr.flush()
            if channel.exit_status_ready() and not channel.recv_ready() and not channel.recv_stderr_ready():
                break

        rc = channel.recv_exit_status()
        # дочитываем хвосты
        rest_out = stdout.read().decode("utf-8", errors="replace")
        if rest_out:
            sys.stdout.write(rest_out)
            sys.stdout.flush()
        rest_err = stderr.read().decode("utf-8", errors="replace")
        if rest_err:
            sys.stderr.write(rest_err)
            sys.stderr.flush()

        if check and rc != 0:
            raise SSHError(f"Удалённая команда вернула код {rc}: {full_cmd}")
        return rc

    def run_capture(self, cmd: str) -> tuple[int, str, str]:
        """Выполнить команду, вернуть (rc, stdout, stderr) без потокового вывода."""
        assert self._client is not None
        stdin, stdout, stderr = self._client.exec_command(cmd, get_pty=False)
        stdin.close()
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        rc = stdout.channel.recv_exit_status()
        return rc, out, err

    def exists(self, remote_path: str) -> bool:
        try:
            self.sftp.stat(remote_path)
            return True
        except FileNotFoundError:
            return False
        except IOError:
            return False

    def mkdir_p(self, remote_path: str) -> None:
        """Рекурсивно создать каталог на сервере."""
        parts = []
        path = remote_path.rstrip("/")
        while path and path != "/":
            parts.append(path)
            path = os.path.dirname(path)
        for p in reversed(parts):
            try:
                self.sftp.stat(p)
            except FileNotFoundError:
                self.sftp.mkdir(p)

    def put(self, local: Path, remote: str, mode: int | None = None) -> None:
        self.mkdir_p(os.path.dirname(remote))
        self.sftp.put(str(local), remote)
        if mode is not None:
            self.sftp.chmod(remote, mode)

    def put_tree_tar(
        self,
        local_dir: Path,
        remote_dir: str,
        excludes: Iterable[str] = (),
    ) -> int:
        """Заливка дерева через tar-стриминг — устойчиво к падению SSH-сессии,
        потому что один файл уезжает за одну операцию, а не 2000+ SFTP-команд.
        """
        import subprocess
        import tarfile
        import tempfile

        local_dir = local_dir.resolve()
        excludes = tuple(excludes)

        # Собираем список файлов с учётом excludes (тем же _walk_local,
        # чтобы поведение совпадало с put_tree).
        files: list[tuple[Path, str]] = []
        for local_path, rel in self._walk_local(local_dir, excludes):
            if local_path.is_file():
                files.append((local_path, rel))
        total = len(files)
        print(f"    собираю tar из {total} файлов…")

        tmp_tar = Path(tempfile.mkdtemp()) / "upload.tar.gz"
        with tarfile.open(tmp_tar, "w:gz", compresslevel=3) as tar:
            for local_path, rel in files:
                tar.add(str(local_path), arcname=rel, recursive=False)
        size_mb = tmp_tar.stat().st_size / (1024 * 1024)
        print(f"    tar готов: {size_mb:.1f} MB")

        remote_tar = f"{remote_dir.rstrip('/')}/__upload.tar.gz"

        def _upload_with_retry(attempts: int = 3) -> None:
            for i in range(1, attempts + 1):
                try:
                    self.mkdir_p(remote_dir)
                    bytes_total = tmp_tar.stat().st_size
                    last_pct = -1
                    def _progress(t, total_bytes):
                        nonlocal last_pct
                        pct = int(t * 100 / total_bytes) if total_bytes else 100
                        if pct >= last_pct + 10 or pct == 100:
                            print(f"    … upload {pct}% ({t // (1024*1024)}/{total_bytes // (1024*1024)} MB)")
                            last_pct = pct
                    self.sftp.put(str(tmp_tar), remote_tar, callback=_progress)
                    return
                except Exception as e:
                    print(f"    ⚠ upload попытка {i} провалилась: {e}")
                    if i == attempts:
                        raise
                    print("    переподключаюсь и повторяю…")
                    self.reconnect()

        try:
            _upload_with_retry()
        finally:
            try:
                tmp_tar.unlink()
            except Exception:
                pass

        print("    распаковываю на сервере…")
        self.run(
            f"cd {remote_dir} && tar -xzf __upload.tar.gz && rm -f __upload.tar.gz",
            check=True,
        )
        return total

    def put_tree(
        self,
        local_dir: Path,
        remote_dir: str,
        excludes: Iterable[str] = (),
    ) -> tuple[int, int]:
        """Рекурсивная заливка каталога. Возвращает (uploaded, skipped)."""
        local_dir = local_dir.resolve()
        excludes = tuple(excludes)
        uploaded = 0
        skipped = 0
        total_files = sum(1 for _ in self._walk_local(local_dir, excludes))
        idx = 0
        for local_path, rel in self._walk_local(local_dir, excludes):
            idx += 1
            remote_path = f"{remote_dir.rstrip('/')}/{rel}"
            if local_path.is_dir():
                self.mkdir_p(remote_path)
                continue
            self.mkdir_p(os.path.dirname(remote_path))
            self.sftp.put(str(local_path), remote_path)
            # сохраняем executable bit при наличии
            st = local_path.stat()
            if st.st_mode & stat.S_IXUSR:
                self.sftp.chmod(remote_path, st.st_mode & 0o777)
            uploaded += 1
            if idx % 25 == 0 or idx == total_files:
                print(f"    … {idx}/{total_files} файлов")
        return uploaded, skipped

    @staticmethod
    def _walk_local(local_dir: Path, excludes: tuple[str, ...]):
        for root, dirs, files in os.walk(local_dir):
            root_path = Path(root)
            rel_root = root_path.relative_to(local_dir)
            # фильтруем каталоги inplace, чтобы os.walk туда не шёл
            dirs[:] = [
                d for d in dirs
                if not _match_any(
                    (rel_root / d).as_posix() if str(rel_root) != "." else d,
                    excludes,
                )
            ]
            for name in files:
                rel_path = (rel_root / name).as_posix() if str(rel_root) != "." else name
                if _match_any(rel_path, excludes):
                    continue
                yield root_path / name, rel_path


def _match_any(rel_path: str, patterns: tuple[str, ...]) -> bool:
    return any(
        fnmatch.fnmatch(rel_path, pat) or fnmatch.fnmatch(os.path.basename(rel_path), pat)
        for pat in patterns
    )

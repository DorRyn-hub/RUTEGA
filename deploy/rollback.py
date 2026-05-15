"""Откат к предыдущему релизу: восстановление из tar-бэкапа на сервере."""

from __future__ import annotations

from ssh_client import SSHClient


def rollback(ssh: SSHClient, backup_archive: str, app_dir: str) -> None:
    """Восстановить app_dir из tar-архива, перезапустить Passenger.

    backup_archive — абсолютный путь к ~/<app>.bak-YYYYMMDD-HHMMSS.tar.gz
    app_dir         — абсолютный путь к каталогу приложения (~/<app>)
    """
    if not ssh.exists(backup_archive):
        raise RuntimeError(f"Бэкап не найден на сервере: {backup_archive}")

    parent = app_dir.rstrip("/").rsplit("/", 1)[0]
    base = app_dir.rstrip("/").rsplit("/", 1)[1]
    broken = f"{app_dir}.broken-rollback"

    print(f"⤺ Rollback: восстанавливаю {app_dir} из {backup_archive}")
    ssh.run(f"rm -rf {broken}", check=False)
    ssh.run(f"mv {app_dir} {broken}", check=False)
    ssh.run(f"mkdir -p {app_dir}")
    ssh.run(f"tar -xzf {backup_archive} -C {parent}")
    # tar упаковывает каталог по имени base, после распаковки получаем app_dir
    ssh.run(f"mkdir -p {app_dir}/tmp && touch {app_dir}/tmp/restart.txt")
    print(f"⤺ Rollback завершён. Сломанная сборка лежит в {broken} (удалите вручную при необходимости).")

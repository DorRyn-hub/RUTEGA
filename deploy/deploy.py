#!/usr/bin/env python3
"""Деплой Rutega на Beget Shared Node.js (PHP-прокси через nodeproxy.php).

Особенности Beget shared:
- Нет `npm`/`npx` в PATH. Используется кастомный бинарь `~/bin/node` + wrapper.
- Node-приложение запускается PHP-прокси (`nodeproxy.php`) на порту 3056.
- Рестарт = убить PID из `/tmp/rutega_node_3056.pid`; прокси поднимет процесс снова.
- Существующий `.htaccess` и `nodeproxy.php` не трогаем — это специфичный для
  Beget routing-слой.
- БД `~/data/prod.db` сохраняется между деплоями.

Запуск из PyCharm: правый клик по deploy.py → Run.
CLI:
  --dry-run       Не подключаться к серверу, только показать план.
  --skip-restart  Не убивать процесс node (для отладки).
"""

from __future__ import annotations

import argparse
import base64
import os
import secrets
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from dotenv import load_dotenv  # noqa: E402

from ssh_client import SSHClient, SSHError  # noqa: E402
import rollback as rollback_mod  # noqa: E402


PROJECT_ROOT = SCRIPT_DIR.parent
DEPLOY_DIR = SCRIPT_DIR

# Файлы, которые НЕ загружаем на сервер (тулинг, креды, артефакты macOS, и
# серверные файлы, которые Beget уже настроил и которые не нужно затирать).
UPLOAD_EXCLUDES = (
    ".env",
    ".env.*",
    "beget.env",
    "server.env",
    "deploy.py",
    "ssh_client.py",
    "rollback.py",
    "requirements.txt",
    ".htaccess",  # на сервере свой Beget-specific .htaccess (rewrite в nodeproxy.php)
    ".htaccess.patched",
    "__pycache__",
    "*.pyc",
    ".DS_Store",
    "._*",  # macOS resource forks
    "dev.db",
    "dev.db-journal",
)

REQUIRED_LOCAL_FILES = (
    ".next/server",
    ".next/static",
    "server.js",
    "package.json",
    "prisma/schema.prisma",
    "public",
    "node_modules",
)

JWT_PLACEHOLDER = "ЗАМЕНИТЕ_НА_ДЛИННУЮ_СЛУЧАЙНУЮ_СТРОКУ_МИНИМУМ_32_СИМВОЛА"

# PID-файл и log-файл, которыми оперирует nodeproxy.php на сервере.
NODE_PID_FILE = "/tmp/rutega_node_3056.pid"
NODE_LOG_FILE = "/tmp/rutega_node_3056.log"
NODE_PORT = 3056


def log(msg: str) -> None:
    print(msg, flush=True)


def fail(msg: str, code: int = 1) -> None:
    print(f"✗ {msg}", file=sys.stderr, flush=True)
    sys.exit(code)


def load_env() -> dict[str, str]:
    env_path = DEPLOY_DIR / "beget.env"
    if not env_path.exists():
        fail(
            f"Нет файла {env_path}.\n"
            "Создайте его (BEGET_HOST/USER/PASS/PATH/DOMAIN/NODE_BIN).\n"
            "Имя 'beget.env' специально, чтобы не конфликтовать с .env-файлами,"
            " которые Next.js standalone build кладёт в deploy/."
        )
    load_dotenv(env_path)
    cfg = {
        "host": os.environ.get("BEGET_HOST", "").strip(),
        "user": os.environ.get("BEGET_USER", "").strip(),
        "password": os.environ.get("BEGET_PASS", "").strip(),
        "path": os.environ.get("BEGET_PATH", "").rstrip("/"),
        "domain": os.environ.get("BEGET_DOMAIN", "").strip(),
        "node_bin": os.environ.get("BEGET_NODE_BIN", "").strip()
        or "/home/k/k84952wc/rutega.ru/public_html/bin/node",
    }
    missing = [k for k, v in cfg.items() if not v and k != "domain"]
    if missing:
        fail(f"В deploy/beget.env не заданы: {', '.join(missing)}")
    return cfg


def validate_artifact() -> None:
    log("→ Проверка артефакта в deploy/")
    missing = []
    for rel in REQUIRED_LOCAL_FILES:
        if not (DEPLOY_DIR / rel).exists():
            missing.append(rel)
    if missing:
        fail(
            "Артефакт неполный. Сначала выполните `bash scripts/build-for-beget.sh`.\n"
            "Не найдено: " + ", ".join(missing)
        )
    # Проверим, что бинарь prisma query engine для linux есть
    prisma_client = DEPLOY_DIR / "node_modules" / ".prisma" / "client"
    linux_engines = list(prisma_client.glob("libquery_engine-debian*.so.node")) + list(
        prisma_client.glob("libquery_engine-linux-musl*.so.node")
    ) if prisma_client.exists() else []
    if not linux_engines:
        log("  ⚠ Не нашёл linux query engine prisma в node_modules/.prisma/client/")
        log("    Проверьте, что schema.prisma имеет binaryTargets с linux-вариантом")
        log("    и что artifact был пересобран после изменения.")
    log("  ✓ артефакт готов")


def gen_secret(length_bytes: int = 48) -> str:
    return base64.b64encode(secrets.token_bytes(length_bytes)).decode("ascii")


def ensure_server_env(domain: str) -> Path:
    """server.env — production .env, для записи в node_wrapper.sh на сервере.

    Создаётся один раз; при повторных деплоях переиспользуется.
    """
    server_env = DEPLOY_DIR / "server.env"
    site_url = f"https://{domain}" if domain else "https://rutega.ru"

    if server_env.exists():
        content = server_env.read_text(encoding="utf-8")
        if JWT_PLACEHOLDER not in content and 'JWT_SECRET=""' not in content:
            log("→ deploy/server.env уже существует, переиспользую")
            return server_env
        log("→ В deploy/server.env плейсхолдер JWT_SECRET — перегенерирую")

    jwt = gen_secret(48)
    demo = gen_secret(32)
    body = f"""NODE_ENV=production
NEXT_PUBLIC_SITE_URL={site_url}

# На Beget DATABASE_URL должен быть АБСОЛЮТНЫМ, потому что Next.js standalone
# делает process.chdir(__dirname), что меняет cwd, и относительный путь к sqlite
# может разъехаться. Значение подставляется в deploy.py при формировании
# node_wrapper.sh из BEGET_PATH + /data/prod.db.
DATABASE_URL=

JWT_SECRET={jwt}
DEMO_SECRET={demo}

DEMO_GATE_ENABLED=false
DEMO_USER=admin2222
DEMO_PASS=karim22333

NEXT_PUBLIC_YANDEX_METRIKA_ID=
NEXT_PUBLIC_YANDEX_MAP_EMBED=
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=
NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY=
SMARTCAPTCHA_SERVER_KEY=

BITRIX24_WEBHOOK_URL=

UNISENDER_API_KEY=
UNISENDER_LIST_ID=1
UNISENDER_FROM_EMAIL=noreply@rutega.ru
ADMIN_ALERT_EMAIL=vladaryndina@gmail.com
"""
    server_env.write_text(body, encoding="utf-8")
    server_env.chmod(0o600)
    log(f"  ✓ записал {server_env} (JWT_SECRET сгенерирован)")
    return server_env


def parse_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, _, v = line.partition("=")
        v = v.strip().strip('"').strip("'")
        out[k.strip()] = v
    return out


def build_node_wrapper(env: dict[str, str], app_path: str, node_bin: str) -> str:
    """Сгенерировать содержимое ~/bin/node_wrapper.sh со всеми env-переменными."""
    db_url = env.get("DATABASE_URL") or f"file:{app_path}/data/prod.db"
    lines = ["#!/bin/bash"]
    lines.append("# Запускается nodeproxy.php. Все env-переменные приложения здесь.")
    keys_order = [
        "NODE_ENV",
        "DEMO_GATE_ENABLED",
        "DATABASE_URL",
        "JWT_SECRET",
        "DEMO_SECRET",
        "DEMO_USER",
        "DEMO_PASS",
        "NEXT_PUBLIC_SITE_URL",
        "NEXT_PUBLIC_YANDEX_METRIKA_ID",
        "NEXT_PUBLIC_YANDEX_MAP_EMBED",
        "NEXT_PUBLIC_YANDEX_MAPS_API_KEY",
        "NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY",
        "SMARTCAPTCHA_SERVER_KEY",
        "BITRIX24_WEBHOOK_URL",
        "UNISENDER_API_KEY",
        "UNISENDER_LIST_ID",
        "UNISENDER_FROM_EMAIL",
        "ADMIN_ALERT_EMAIL",
    ]
    merged = {**env, "DATABASE_URL": db_url}
    for k in keys_order:
        v = merged.get(k, "")
        # экранируем bash-небезопасные символы простым quoting
        v_escaped = v.replace("\\", "\\\\").replace('"', '\\"').replace("`", "\\`").replace("$", "\\$")
        lines.append(f'export {k}="{v_escaped}"')
    lines.append('export PORT=${PORT:-3056}')
    lines.append("export HOSTNAME=127.0.0.1")
    lines.append(f'exec {node_bin} {app_path}/server.js "$@"')
    return "\n".join(lines) + "\n"


def make_backup(ssh: SSHClient, app_dir: str) -> str | None:
    """Бэкап текущего app_dir (только важных директорий, без node_modules)."""
    if not ssh.exists(app_dir):
        return None
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    archive = f"{app_dir}/../rutega-bak-{ts}.tar.gz"
    log(f"→ Backup существующего деплоя (без node_modules) → {archive}")
    cmd = (
        f"tar -czf {archive} -C {app_dir} "
        "--exclude=node_modules --exclude=.next --exclude=._* "
        "data prisma server.js .htaccess nodeproxy.php bin package.json 2>/dev/null || true"
    )
    ssh.run(cmd, check=False)
    rc = ssh.run(f"test -s {archive}", check=False)
    if rc != 0:
        log("  · бэкап пустой/невозможен — пропускаю retention")
        return None
    ssh.run(
        f"ls -1t {app_dir}/../rutega-bak-*.tar.gz 2>/dev/null | tail -n +4 | xargs -r rm -f",
        check=False,
    )
    return archive


def restart_node(ssh: SSHClient, domain: str, host: str) -> None:
    """Убить старый node-процесс и инициировать рестарт через HTTP-запрос.

    Сам сервер запускает nodeproxy.php при первом запросе.
    """
    log("→ Перезапуск Node-процесса")
    ssh.run(
        f"if [ -f {NODE_PID_FILE} ]; then "
        f"  PID=$(cat {NODE_PID_FILE}); "
        f"  echo \"Старый PID: $PID\"; "
        f"  kill -TERM \"$PID\" 2>/dev/null || true; "
        f"  sleep 1; "
        f"  kill -KILL \"$PID\" 2>/dev/null || true; "
        f"  rm -f {NODE_PID_FILE}; "
        f"fi",
        check=False,
    )
    # cleanup log
    ssh.run(f"rm -f {NODE_LOG_FILE}", check=False)


def http_check(url: str, timeout: int = 30) -> tuple[int, dict[str, str]]:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, method="GET")
    req.add_header("User-Agent", "rutega-deploy-check/1.0")
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
        headers = {k.lower(): v for k, v in resp.headers.items()}
        return resp.status, headers


def verify_http(domain: str, host: str, ssh: SSHClient) -> bool:
    candidates = []
    if domain:
        candidates.append(f"https://{domain}/")
        candidates.append(f"http://{domain}/")
    candidates.append(f"http://{host}/")
    candidates.append(f"https://{host}/")

    last_err: Exception | None = None
    for url in candidates:
        log(f"→ Проверка {url}")
        for attempt in range(1, 7):
            try:
                status, headers = http_check(url)
            except urllib.error.HTTPError as e:
                if 200 <= e.code < 400:
                    log(f"  ✓ HTTP {e.code} ({e.reason})")
                    return True
                if e.code in (301, 302, 303, 307, 308):
                    log(f"  · {url} → редирект {e.code}")
                    return True
                if e.code == 503:
                    log(f"  · попытка {attempt}: 503 — node ещё стартует")
                    # покажем последние строки лога
                    rc, out, _ = ssh.run_capture(f"tail -20 {NODE_LOG_FILE} 2>/dev/null")
                    if out.strip():
                        log("    node-лог:")
                        for ln in out.strip().splitlines():
                            log("      " + ln)
                else:
                    log(f"  · попытка {attempt}: HTTP {e.code} ({e.reason})")
                last_err = e
            except (urllib.error.URLError, ssl.SSLError, ConnectionError, TimeoutError) as e:
                last_err = e
                log(f"  · попытка {attempt}: {e}")
            else:
                log(f"  ✓ HTTP {status}")
                hsts = headers.get("strict-transport-security")
                csp = headers.get("content-security-policy")
                xfo = headers.get("x-frame-options")
                log(f"    HSTS: {'есть' if hsts else 'нет'}")
                log(f"    CSP : {'есть' if csp else 'нет'}")
                log(f"    XFO : {xfo or 'нет'}")
                return True
            time.sleep(7)
    log(f"✗ Не удалось получить ответ. Последняя ошибка: {last_err}")
    return False


def run_local_build_check(skip_build: bool) -> None:
    if skip_build:
        return
    server_js = DEPLOY_DIR / "server.js"
    next_dir = DEPLOY_DIR / ".next"
    node_modules = DEPLOY_DIR / "node_modules"
    if server_js.exists() and next_dir.exists() and node_modules.exists():
        return
    log("→ Артефакт не найден — запускаю scripts/build-for-beget.sh")
    env = os.environ.copy()
    env.setdefault("DATABASE_URL", "file:./dev.db")
    result = subprocess.run(
        ["bash", str(PROJECT_ROOT / "scripts" / "build-for-beget.sh")],
        cwd=str(PROJECT_ROOT),
        env=env,
    )
    if result.returncode != 0:
        fail("Локальная сборка завершилась с ошибкой.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Deploy Rutega to Beget.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-restart", action="store_true")
    parser.add_argument("--skip-build", action="store_true")
    args = parser.parse_args()

    cfg = load_env()
    log(f"→ Деплой на {cfg['user']}@{cfg['host']}:{cfg['path']}")
    log(f"  Домен  : {cfg['domain'] or '(не задан)'}")
    log(f"  Node   : {cfg['node_bin']}")

    run_local_build_check(args.skip_build)
    validate_artifact()
    server_env_path = ensure_server_env(cfg["domain"])
    env_vars = parse_env_file(server_env_path)
    wrapper_body = build_node_wrapper(env_vars, cfg["path"], cfg["node_bin"])

    if args.dry_run:
        log("→ DRY RUN")
        log("  ── node_wrapper.sh ──")
        for ln in wrapper_body.splitlines():
            log(f"  {ln}")
        log("  ─────────────────────")
        from ssh_client import _match_any  # type: ignore
        count = 0
        for root, dirs, files in os.walk(DEPLOY_DIR):
            root_path = Path(root)
            rel_root = root_path.relative_to(DEPLOY_DIR)
            dirs[:] = [
                d for d in dirs
                if not _match_any(
                    (rel_root / d).as_posix() if str(rel_root) != "." else d,
                    UPLOAD_EXCLUDES,
                )
            ]
            for name in files:
                rel_path = (rel_root / name).as_posix() if str(rel_root) != "." else name
                if _match_any(rel_path, UPLOAD_EXCLUDES):
                    continue
                count += 1
        log(f"  Файлов к заливке: {count}")
        return 0

    backup_archive: str | None = None
    try:
        with SSHClient(cfg["host"], cfg["user"], cfg["password"]) as ssh:
            log("→ Подключение установлено")
            rc, out, _ = ssh.run_capture("uname -a")
            log("  Сервер: " + out.strip())

            # 1. Backup
            backup_archive = make_backup(ssh, cfg["path"])

            # 2. ensure dirs
            ssh.run(f"mkdir -p {cfg['path']}/data {cfg['path']}/bin")

            # 3. Tar-streamed upload (устойчиво к обрыву SSH на 2000+ файлах)
            log("→ Заливка артефакта (tar-streaming)")
            uploaded = ssh.put_tree_tar(DEPLOY_DIR, cfg["path"], excludes=UPLOAD_EXCLUDES)
            log(f"  ✓ распаковано файлов: {uploaded}")

            # 4. удалить артефакты ._  если они уже есть
            ssh.run(f"find {cfg['path']} -name '._*' -type f -delete 2>/dev/null", check=False)

            # 5. node_wrapper.sh с production-секретами
            log("→ Запись ~/bin/node_wrapper.sh c production-env")
            import tempfile
            tmp = Path(tempfile.mkdtemp()) / "node_wrapper.sh"
            tmp.write_text(wrapper_body, encoding="utf-8")
            tmp.chmod(0o700)
            ssh.put(tmp, f"{cfg['path']}/bin/node_wrapper.sh", mode=0o755)
            tmp.unlink()

            # 6. Безопасный .env-файл для прочих утилит (на всякий случай, не обязателен)
            ssh.put(server_env_path, f"{cfg['path']}/.env", mode=0o600)

            # 7. Restart
            if not args.skip_restart:
                restart_node(ssh, cfg["domain"], cfg["host"])
            else:
                log("→ Рестарт пропущен (--skip-restart)")

            time.sleep(2)

            # 8. HTTP verify (через nodeproxy.php автоматически стартанёт node)
            ok = verify_http(cfg["domain"], cfg["host"], ssh)
            if not ok:
                raise RuntimeError("HTTP-проверка не прошла")

        log("✓ Деплой завершён успешно.")
        if cfg["domain"]:
            log(f"  Открыть: https://{cfg['domain']}/")
        return 0

    except Exception as exc:
        log(f"✗ Ошибка деплоя: {exc}")
        if backup_archive:
            log(f"  Бэкап: {backup_archive} (восстановите вручную при необходимости)")
        return 2


if __name__ == "__main__":
    sys.exit(main())

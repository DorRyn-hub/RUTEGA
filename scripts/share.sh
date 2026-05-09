#!/usr/bin/env bash
# Поднимает прод-сервер Rutega и Cloudflare Quick Tunnel,
# выводит публичный HTTPS-URL и оставляет всё работать в фоне
# даже после закрытия терминала.
#
# Использование:
#   ./scripts/share.sh                 # запуск (или печать URL, если уже работает)
#   ./scripts/share.sh --restart       # принудительно перезапустить
#   ./scripts/share.sh --foreground    # старый блокирующий режим (Ctrl-C → стоп)
#   ./scripts/share.sh --status        # показать состояние и URL
#   ./scripts/share.sh --stop          # остановить туннель и сервер
#   ./scripts/share.sh --logs          # tail -f логов туннеля
#   ./scripts/share.sh --build         # форс-пересборка перед запуском
#   ./scripts/share.sh --port 3001     # свой порт
#
# Фоновый режим: процессы переживают закрытие терминала (nohup + disown).
# URL сохраняется в .share/url.txt, логи — в .share/{server,tunnel}.log.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT=3000
FORCE_BUILD=0
MODE="start"          # start | restart | stop | status | logs
FOREGROUND=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build)      FORCE_BUILD=1; shift ;;
    --port)       PORT="$2"; shift 2 ;;
    --foreground) FOREGROUND=1; shift ;;
    --restart)    MODE="restart"; shift ;;
    --stop)       MODE="stop"; shift ;;
    --status)     MODE="status"; shift ;;
    --logs)       MODE="logs"; shift ;;
    -h|--help)
      sed -n '2,18p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) echo "Неизвестный аргумент: $1" >&2; exit 1 ;;
  esac
done

STATE_DIR="$ROOT_DIR/.share"
mkdir -p "$STATE_DIR"
SERVER_PID_FILE="$STATE_DIR/server.pid"
TUNNEL_PID_FILE="$STATE_DIR/tunnel.pid"
TUNNEL_LOG="$STATE_DIR/tunnel.log"
SERVER_LOG="$STATE_DIR/server.log"
URL_FILE="$STATE_DIR/url.txt"

red()    { printf "\033[0;31m%s\033[0m\n" "$*"; }
green()  { printf "\033[0;32m%s\033[0m\n" "$*"; }
blue()   { printf "\033[0;34m%s\033[0m\n" "$*"; }
yellow() { printf "\033[0;33m%s\033[0m\n" "$*"; }

is_alive() {
  local file="$1"
  [[ -f "$file" ]] || return 1
  local pid
  pid="$(cat "$file" 2>/dev/null || true)"
  [[ -n "${pid:-}" ]] || return 1
  kill -0 "$pid" 2>/dev/null
}

kill_pid_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    local pid
    pid="$(cat "$file" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      sleep 0.3
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$file"
  fi
}

stop_all() {
  yellow "→ Останавливаю туннель и сервер…"
  kill_pid_file "$TUNNEL_PID_FILE"
  kill_pid_file "$SERVER_PID_FILE"
  green "Остановлено."
}

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "Не найдено: $1"
    case "$1" in
      cloudflared) echo "Установите: brew install cloudflared" ;;
      node|npm)    echo "Установите Node.js 20+ и повторите." ;;
    esac
    exit 1
  fi
}

print_status() {
  local server_alive=0 tunnel_alive=0
  is_alive "$SERVER_PID_FILE" && server_alive=1
  is_alive "$TUNNEL_PID_FILE" && tunnel_alive=1

  if [[ $server_alive == 1 ]]; then
    green "Server:  running (pid $(cat "$SERVER_PID_FILE"), port $PORT)"
  else
    red   "Server:  stopped"
  fi
  if [[ $tunnel_alive == 1 ]]; then
    green "Tunnel:  running (pid $(cat "$TUNNEL_PID_FILE"))"
  else
    red   "Tunnel:  stopped"
  fi

  if [[ -f "$URL_FILE" ]]; then
    local url
    url="$(cat "$URL_FILE")"
    if [[ $tunnel_alive == 1 ]]; then
      green "URL:     $url"
    else
      red   "URL:     $url  (туннель не запущен — URL не действителен)"
    fi
  else
    yellow "URL:     не запускали"
  fi
}

case "$MODE" in
  status)
    print_status
    exit 0 ;;
  stop)
    stop_all
    exit 0 ;;
  logs)
    if [[ ! -f "$TUNNEL_LOG" ]]; then
      red "Лог $TUNNEL_LOG ещё не создан — запустите 'npm run share' сначала."
      exit 1
    fi
    exec tail -n 50 -f "$TUNNEL_LOG" ;;
esac

# === start / restart ===

require node
require npm
require cloudflared

# Если уже работает и просто start — печатаем существующий URL и выходим.
if [[ "$MODE" == "start" ]] && is_alive "$SERVER_PID_FILE" && is_alive "$TUNNEL_PID_FILE"; then
  if [[ -f "$URL_FILE" ]]; then
    URL="$(cat "$URL_FILE")"
    if curl -fsS -m 5 -o /dev/null "$URL/"; then
      blue "Туннель уже работает — переиспользую."
      echo
      green "════════════════════════════════════════════════════"
      green "  Публичный URL:  $URL"
      green "════════════════════════════════════════════════════"
      echo
      yellow "Управление:"
      yellow "  npm run share:status   — состояние и URL"
      yellow "  npm run share:stop     — остановить"
      yellow "  npm run share:logs     — логи туннеля"
      exit 0
    fi
    yellow "Туннель не отвечает (домен мог протухнуть) — перезапускаю."
  fi
fi

# Прибиваем остатки.
kill_pid_file "$TUNNEL_PID_FILE"
kill_pid_file "$SERVER_PID_FILE"

# Освобождаем порт, если занят.
if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
  yellow "Порт $PORT занят, освобождаю…"
  lsof -ti tcp:"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 0.5
fi

# .env с временным JWT_SECRET, если нет.
if [[ ! -f .env ]]; then
  yellow ".env отсутствует — создаю с временным JWT_SECRET"
  {
    echo 'DATABASE_URL="file:./dev.db"'
    printf 'JWT_SECRET="%s"\n' "$(openssl rand -base64 48 | tr -d '\n')"
    echo "NEXT_PUBLIC_SITE_URL=\"http://localhost:$PORT\""
  } > .env
fi

# Сборка.
if [[ ! -f .next/BUILD_ID ]] || [[ "$FORCE_BUILD" == "1" ]]; then
  blue "→ Собираю production-билд (npm run build)…"
  rm -rf .next
  npm run build
fi

# Foreground — ставим trap; для фона trap НЕ ставим, чтобы EXIT shell не убил процессы.
if [[ "$FOREGROUND" == "1" ]]; then
  cleanup() { echo; stop_all; }
  trap cleanup INT TERM EXIT
fi

blue "→ Запускаю сервер на порту ${PORT}…"
# nohup + disown → процесс переживёт закрытие терминала (SIGHUP).
nohup env PORT="$PORT" npm run start > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$SERVER_PID_FILE"
disown "$SERVER_PID" 2>/dev/null || true

# Ждём готовности сервера до 30 сек.
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/"; then
    break
  fi
  sleep 1
done
if ! curl -fsS -o /dev/null "http://127.0.0.1:$PORT/"; then
  red "Сервер не отвечает на http://127.0.0.1:$PORT/"
  echo "Лог: $SERVER_LOG"
  exit 1
fi
green "✓ Сервер работает на http://127.0.0.1:$PORT"

blue "→ Запускаю cloudflared tunnel…"
: > "$TUNNEL_LOG"
nohup cloudflared tunnel --url "http://localhost:$PORT" --no-autoupdate \
  > "$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!
echo "$TUNNEL_PID" > "$TUNNEL_PID_FILE"
disown "$TUNNEL_PID" 2>/dev/null || true

# Ждём появления URL до 30 сек.
URL=""
for _ in $(seq 1 30); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1 || true)"
  [[ -n "$URL" ]] && break
  sleep 1
done

if [[ -z "$URL" ]]; then
  red "Не удалось получить URL туннеля. Лог: $TUNNEL_LOG"
  tail -20 "$TUNNEL_LOG" || true
  exit 1
fi

echo "$URL" > "$URL_FILE"

echo
green "════════════════════════════════════════════════════"
green "  Публичный URL:  $URL"
green "  Демо-доступ:    demo@rutega.ru / Demo12345!"
green "  Админ:          karim2222 / karim22333"
green "════════════════════════════════════════════════════"
echo

if [[ "$FOREGROUND" == "1" ]]; then
  yellow "Foreground-режим. Логи: $SERVER_LOG  и  $TUNNEL_LOG"
  yellow "Нажмите Ctrl-C, чтобы остановить туннель и сервер."
  echo
  wait "$TUNNEL_PID"
else
  yellow "Туннель и сервер работают в фоне — терминал можно закрыть."
  yellow "Управление:"
  yellow "  npm run share:status   — состояние и URL"
  yellow "  npm run share:stop     — остановить"
  yellow "  npm run share:logs     — логи туннеля"
fi

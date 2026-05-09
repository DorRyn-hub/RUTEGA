#!/usr/bin/env bash
# Локальная сборка артефакта для деплоя на Beget Shared Node.js.
# На выходе: каталог ./deploy/, готовый к заливке через SFTP/Git/панель.
#
# Использование: bash scripts/build-for-beget.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_DIR="$ROOT_DIR/deploy"
echo "→ Сборка для Beget. Корень: $ROOT_DIR"

echo "→ Очистка предыдущей сборки"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "→ npm ci"
npm ci

echo "→ next build (standalone output)"
npm run build

echo "→ Копирование артефактов в deploy/"
# Standalone server (содержит минимальный node_modules).
cp -R .next/standalone/. "$DEPLOY_DIR/"
# Статика (CSS, JS-чанки, картинки next/image-оптимизации).
mkdir -p "$DEPLOY_DIR/.next/static"
cp -R .next/static/. "$DEPLOY_DIR/.next/static/"
# public/ (favicon, og-image, прочая статика).
if [ -d public ]; then
  mkdir -p "$DEPLOY_DIR/public"
  cp -R public/. "$DEPLOY_DIR/public/"
fi
# Prisma schema + миграции — нужны для prisma migrate deploy на сервере.
mkdir -p "$DEPLOY_DIR/prisma"
cp -R prisma/. "$DEPLOY_DIR/prisma/"

# Точка входа Passenger и .htaccess.
cp server.js "$DEPLOY_DIR/server.js"
cp .htaccess "$DEPLOY_DIR/.htaccess"

# package.json для prisma generate / db seed (start не используется — Passenger
# вызывает server.js напрямую).
cp package.json "$DEPLOY_DIR/package.json"
cp package-lock.json "$DEPLOY_DIR/package-lock.json"

echo "→ Каталог data/ для SQLite"
mkdir -p "$DEPLOY_DIR/data"

cat <<EOF

✓ Сборка готова: $DEPLOY_DIR

Дальше:
  1. Залейте содержимое deploy/ в каталог приложения на Beget (SFTP или Git).
  2. На панели Beget укажите server.js как startup file, Node.js >= 20.
  3. Создайте .env по образцу .env.example прямо в каталоге приложения.
  4. По SSH:
       cd ~/<app-dir>
       npm ci --omit=dev   # установит prisma + клиент в host node_modules
       npx prisma migrate deploy
       npx prisma db seed
  5. Перезапустите приложение из панели Beget или 'touch tmp/restart.txt'.

EOF

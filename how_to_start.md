# Rutega — Быстрый старт

Полное руководство: локальная разработка → сборка → деплой на Beget.

---

## 1. Требования

| Инструмент | Версия |
|-----------|--------|
| Node.js | ≥ 20 LTS |
| npm | ≥ 10 |
| Python | ≥ 3.10 |
| Git | любая |

---

## 2. Первый запуск (локально)

```bash
# Клонируем репозиторий
git clone <DorRyn-hub/RUTEGA>
cd Rutega_website

# Создаём .env из примера
cp .env.example .env

# Обязательно: задайте JWT_SECRET (≥ 32 символа)
# Откройте .env и отредактируйте:
#   JWT_SECRET=какой-нибудь-длинный-случайный-секрет-32+символа
#   DATABASE_URL=file:./prisma/dev.db

# Устанавливаем зависимости (postinstall запускает prisma generate)
npm install

# Создаём базу данных и накатываем миграции
npx prisma migrate dev --name init

# Заполняем БД тестовыми данными
npm run prisma:seed

# Запускаем сервер разработки
npm run dev
```

Сайт будет доступен на http://localhost:3000

---

## 3. Учётные данные после seed

| Роль | Логин | Пароль |
|------|-------|--------|
| B2C демо | demo@rutega.ru | Demo12345! |
| Администратор | karim2222 | karim22333 |
| Demo-gate (`/demo-access`) | значение `DEMO_USER` в `.env` | значение `DEMO_PASS` |

---

## 4. Основные команды

```bash
npm run dev           # Сервер разработки на :3000
npm run build         # Сборка (prisma generate + next build)
npm run start         # Продакшн-сервер на :3000
npm run typecheck     # Проверка типов TypeScript
npm run lint          # ESLint
npm test              # Vitest (unit-тесты)
npm run test:e2e      # Playwright E2E (требует npm run build первым)
npm run prisma:seed   # Повторный seed (идемпотентный)
npm run prisma:migrate # Новая миграция в dev-режиме
```

---

## 5. Деплой на Beget

### 5.1 Подготовка deploy/.env

```bash
cd deploy
cp .env.example .env
```

Откройте `deploy/.env` и заполните:

```
BEGET_HOST=k84952wc.beget.tech
BEGET_USER=k84952wc_rutega
BEGET_PASS=ваш_пароль
BEGET_PATH=/home/k84952wc/rutega_website
BEGET_PM2_APP=rutega
```

> **Важно:** `deploy/.env` добавлен в `.gitignore`. Никогда не коммитьте реальные пароли.

### 5.2 Установка Python-зависимостей

```bash
cd deploy
pip install -r requirements.txt
```

### 5.3 Сборка проекта

```bash
# В корне проекта:
bash scripts/build-for-beget.sh
```

Скрипт создаёт директорию `deploy/` с production-сборкой.

### 5.4 Запуск деплоя

**Из PyCharm:** откройте `deploy/deploy.py` → нажмите кнопку ▶ Run.

**Из терминала:**

```bash
cd deploy
python deploy.py
```

**Тестовый прогон без изменений:**

```bash
python deploy.py --dry-run
```

### 5.5 Что делает deploy.py

1. Создаёт локальный backup (`.backups/rutega_backup_TIMESTAMP.tar.gz`)
2. Подключается к Beget по SSH
3. Загружает файлы через SFTP
4. Выполняет на сервере:
   - `npm ci --production`
   - `npx prisma generate`
   - `npx prisma migrate deploy`
   - `npm run build`
   - `pm2 restart rutega --update-env`
5. Проверяет, что PM2 сообщает статус `online`
6. При ошибке — автоматически откатывается на предыдущую версию

---

## 6. Откат вручную

```bash
cd deploy
python -c "
import os, sys
sys.path.insert(0, '.')
from dotenv import load_dotenv; load_dotenv('.env')
from ssh_client import SSHClient
import rollback
with SSHClient(os.environ['BEGET_HOST'], os.environ['BEGET_USER'], os.environ['BEGET_PASS']) as ssh:
    rollback.rollback(ssh, '../.backups', os.environ['BEGET_PATH'], os.environ['BEGET_PM2_APP'])
"
```

---

## 7. Переменные окружения (продакшн)

Для production-сервера создайте `.env.production` (или задайте переменные напрямую в PM2):

```
NODE_ENV=production
DATABASE_URL=file:./data/prod.db
JWT_SECRET=<≥32 random chars>
DEMO_GATE_ENABLED=false          # или true, если сайт ещё закрыт

# Yandex (опционально)
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=...
NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY=...
SMARTCAPTCHA_SERVER_KEY=...

# CRM + Email (опционально)
BITRIX24_WEBHOOK_URL=...
UNISENDER_API_KEY=...
ADMIN_ALERT_EMAIL=...
```

---

## 8. Частые проблемы

| Проблема | Решение |
|---------|---------|
| `prisma generate` падает | Удалите `node_modules` и запустите `npm install` снова |
| Demo-gate не пускает | Проверьте `DEMO_GATE_ENABLED` и `DEMO_USER`/`DEMO_PASS` в `.env` |
| Страница `/lk` даёт 404 | Убедитесь, что пользователь существует — запустите `npm run prisma:seed` |
| PM2 не стартует на сервере | SSH на сервер, `pm2 logs rutega` — смотрите ошибку |
| `BEGET_PASS is not set` | Создайте `deploy/.env` из `deploy/.env.example` |
| Barlow Condensed не грузится | Проверьте интернет-соединение при первой сборке; шрифт кешируется |

---

## 9. Структура проекта (ключевые директории)

```
src/
  app/            # Next.js App Router (pages, layouts, API routes)
  components/     # React-компоненты (ui/, marketing/, admin/, layout/)
  data/           # Seed-данные (services, tariffs, cases, ...)
  lib/            # Утилиты (auth, billing, repos, validation, ...)
  types/          # TypeScript-типы
prisma/
  schema.prisma   # Схема БД
  seed.ts         # Наполнение БД
deploy/
  deploy.py       # Деплой-скрипт
scripts/
  build-for-beget.sh  # Сборка для Beget
```

---

Если что-то пошло не так — смотрите логи `pm2 logs rutega` на сервере или `npm run dev` локально.

# Деплой Rutega на Beget Shared Node.js

Этот документ — пошаговая инструкция первичного запуска и обновлений сайта на shared-хостинге Beget с поддержкой Node.js. Хостинг на shared имеет ограничения (Passenger вместо PM2, лимит на память, нет фоновых процессов) — соответствующие компромиссы описаны ниже.

## Требования к тарифу Beget

- Тариф с поддержкой Node.js (например, **«Бегет.Старт» или выше**).
- Node.js версии **≥ 20** в панели приложения.
- Исходящий доступ к интернету (для CRM/captcha-валидации).
- Свободное место **≥ 500 МБ** (next standalone + .next/static + public + node_modules ≈ 200 МБ).

## Один раз: настройка приложения

1. **Создайте Node.js-приложение** в панели Beget (Сайты → Node.js → Создать).
   - Версия Node.js: **20.x**.
   - Имя домена / поддомен: на ваш выбор.
   - Каталог приложения (App root): `/home/<user>/<имя_приложения>`.
   - Startup file: `server.js`.
2. **Подключите домен** и **выпустите Let's Encrypt** (Сайты → Сертификаты — Beget делает это в один клик).
3. **Создайте файл `.env`** в корне приложения (по образцу `.env.example`). Минимально нужно:
   - `JWT_SECRET` — длинная случайная строка (`openssl rand -base64 48`).
   - `DEMO_SECRET` — отдельная строка или пусто (тогда используется `JWT_SECRET`).
   - `DATABASE_URL="file:./data/prod.db"`.
   - `NEXT_PUBLIC_SITE_URL="https://ваш-домен.ru"`.
   - `NODE_ENV="production"`.
   - Опционально: `NEXT_PUBLIC_YANDEX_METRIKA_ID`, `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`, `NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY`, `SMARTCAPTCHA_SERVER_KEY`, `BITRIX24_WEBHOOK_URL`, `UNISENDER_API_KEY`, `ADMIN_ALERT_EMAIL`.

## Сборка локально (выгружаемый артефакт)

В проекте есть готовый скрипт:

```bash
bash scripts/build-for-beget.sh
```

Скрипт делает:
1. `npm ci` (чистая установка).
2. `npm run build` (Prisma generate + Next.js build с `output: 'standalone'`).
3. Собирает каталог `deploy/`, в котором лежит ровно то, что нужно залить на Beget:
   - `server.js` — точка входа Passenger.
   - `.htaccess` — конфиг Passenger.
   - `.next/` — собранный Next.js (standalone).
   - `public/` — статика.
   - `prisma/` — schema + миграции.
   - `package.json`, `package-lock.json` — для `npm ci` на сервере.
   - `data/` — пустой каталог под SQLite.

## Заливка на Beget

Способ 1 (рекомендуется) — **SFTP**:

```bash
# с локальной машины
rsync -avz --delete deploy/ <user>@<server>.beget.tech:/home/<user>/<app-dir>/
```

Способ 2 — **Git**:
1. Залейте `deploy/` в отдельный репозиторий (или ветку) и подключите его в панели Beget («Деплой из Git»).
2. На каждый push Beget сам подтянет изменения.

После заливки **не забудьте** обновить `.htaccess`: подставить реальный путь в `PassengerAppRoot` и раскомментировать `PassengerNodejs` с правильной версией.

## Первый запуск на сервере (по SSH)

```bash
ssh <user>@<server>.beget.tech
cd ~/<app-dir>

# Установить runtime-зависимости (prisma client и т. п.)
npm ci --omit=dev

# Применить миграции и засеять БД
npx prisma migrate deploy
npx prisma db seed

# Перезапустить приложение
mkdir -p tmp && touch tmp/restart.txt
```

Откройте `https://ваш-домен.ru/`. Должна загрузиться главная.

## Проверка после деплоя

```bash
# Заголовки безопасности — должны вернуть HSTS, CSP, X-Frame-Options
curl -I https://ваш-домен.ru/

# Карта покрытия (JSON)
curl https://ваш-домен.ru/api/coverage | head

# Список кейсов
curl https://ваш-домен.ru/api/cases | head
```

В админке (`/admin/login` — логин `karim2222` / `karim22333`) проверьте:
- В разделе «Лиды» появляются заявки с сайта.
- В разделе «Услуги/Тарифы/Новости» — записи отображаются.

## Обновление (релиз)

```bash
# Локально:
bash scripts/build-for-beget.sh
rsync -avz --delete deploy/ <user>@<server>.beget.tech:/home/<user>/<app-dir>/

# На сервере:
cd ~/<app-dir>
npx prisma migrate deploy   # если есть новые миграции
mkdir -p tmp && touch tmp/restart.txt
```

## Бэкап SQLite

`prod.db` — единственный важный stateful-файл. Бэкап через cron в панели Beget или вручную:

```bash
# на сервере
mkdir -p ~/backups
cp ~/<app-dir>/data/prod.db ~/backups/prod-$(date +%F).db
# хранить хотя бы 14 дней
find ~/backups -name 'prod-*.db' -mtime +14 -delete
```

## Известные ограничения shared Node.js

- **Нет долгоживущих фоновых процессов** — биллинг (`/api/admin/billing/run`) дёргается вручную из админки или по расписанию через внешний планировщик (cron на отдельной машине, GitHub Actions на schedule, Я.Облако Cloud Functions).
- **Лимит памяти** ~512 МБ — `output: 'standalone'` именно для этого: минимальный runtime-bundle.
- **Перезапуск приложения** — `touch tmp/restart.txt` (стандартный Passenger-механизм). На некоторых тарифах есть кнопка в панели Beget.
- **Логи** — пишутся Passenger в свой файл (путь — в панели Beget). `console.log` из приложения попадает туда же.
- **SQLite на shared** работает, но если упрётесь в `SQLITE_BUSY` или квоты — мигрируйте на PostgreSQL/MySQL Beget. Нужно изменить `provider` в `prisma/schema.prisma` и перезапустить `npx prisma migrate dev` локально, потом `migrate deploy` на сервере.

## Откат (rollback)

Beget хранит предыдущую версию автоматически только если используете «Деплой из Git» — там обычная checkout-схема. При SFTP делайте:

```bash
# перед заливкой — копия текущего билда
ssh <user>@<server>.beget.tech "cp -r ~/<app-dir> ~/<app-dir>.backup-$(date +%F)"
```

Если новый релиз сломан — `mv ~/<app-dir> ~/<app-dir>.broken && mv ~/<app-dir>.backup-* ~/<app-dir> && touch ~/<app-dir>/tmp/restart.txt`.

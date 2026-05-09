
# Rutega — сайт интернет-провайдера

Production-ready MVP сайта провайдера: маркетинговая часть (главная, услуги, тарифы, B2B,
новости, поддержка, контакты) и Личный кабинет с реальной авторизацией.

**Стек:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Prisma + SQLite ·
JWT в HttpOnly cookie · Zod · React Hook Form · Vitest · Playwright · Docker.

---

## Быстрый старт

```bash
cp .env.example .env
# заполните JWT_SECRET (≥32 символа): openssl rand -base64 48

npm install
npx prisma migrate dev --name init
npm run prisma:seed

npm run dev                       # http://localhost:3000
```

Демо-доступ к ЛК: `demo@rutega.ru` / `Demo12345!`

---

## Команды

| Команда | Назначение |
|---|---|
| `npm run dev` | Запуск Next.js dev-сервера |
| `npm run build` | Production-сборка (включает `prisma generate`) |
| `npm run start` | Запуск production-сервера |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (юнит-тесты: auth, валидация, формат, rate-limit) |
| `npm run test:e2e` | Playwright (smoke-тесты главной и формы входа) |
| `npm run prisma:migrate` | Создать/применить миграцию (dev) |
| `npm run prisma:deploy` | Применить миграции (prod) |
| `npm run prisma:seed` | Заполнить БД seed-данными |

---

## Переменные окружения

См. `.env.example`:

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения Prisma (по умолчанию `file:./dev.db`) |
| `JWT_SECRET` | секрет JWT (≥32 символа). Обязательно. |
| `NEXT_PUBLIC_SITE_URL` | базовый URL для абсолютных ссылок, sitemap, OG |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | счётчик Метрики (пусто — отключено) |
| `NEXT_PUBLIC_YANDEX_MAP_EMBED` | URL iframe Яндекс.Карт для `/contacts` |

Чтобы перейти на PostgreSQL — поменяйте `provider` в `prisma/schema.prisma`, обновите
`DATABASE_URL` и пересоздайте миграции.

---

## Архитектура

```
src/
├── app/                       # App Router
│   ├── (marketing)/           # публичная часть, layout с Header/Footer
│   ├── (auth)/                # страницы /lk/login и /lk/register, без хедера
│   ├── (account)/             # ЛК, защищённый layout с Sidebar
│   ├── api/                   # Route Handlers (auth, services, news, billing, leads…)
│   ├── sitemap.ts             # генерация sitemap.xml из БД
│   ├── robots.ts              # robots.txt (запрещает /lk и /api)
│   ├── layout.tsx             # шрифты, ToastProvider, Yandex.Metrika, Organization JSON-LD
│   └── globals.css            # Tailwind v4 @theme + базовые стили
├── components/                # ui/, layout/, marketing/, seo/, account/
├── data/                      # seed-источники (services, tariffs, news, faq, advantages, company)
├── lib/                       # prisma client, auth, validation, format, rate-limit, repos
├── middleware.ts              # защита /lk/*
├── tests/{unit,e2e}/          # Vitest и Playwright
└── types/domain.ts            # доменные DTO
```

### Авторизация

- bcrypt (cost 12) + JWT (HS256, 7 дней) через `jose`.
- Cookie `rutega_session` — `HttpOnly`, `SameSite=Lax`, `Secure` в проде.
- `middleware.ts` редиректит без сессии с `/lk/*` на `/lk/login` (кроме самих login/register).
- `getCurrentUser()` в RSC использует `cookies()` и валидирует JWT.
- Rate-limit (token-bucket в памяти): login 5/5мин, register 5/5мин, contact/leads 3/мин.

### Безопасность

- HTTPS-only cookie в проде.
- CSP, `X-Frame-Options`, `Permissions-Policy` через `next.config.ts` `headers()`.
- Все вводы — через `zod`, никаких сырых `JSON.parse`.
- Honeypot + rate-limit на публичных формах.
- Согласие на обработку ПД (152-ФЗ) обязательно при регистрации.

### Контент и CMS

Сейчас данные лежат в `src/data/*.ts` и через `prisma/seed.ts` попадают в БД. Структура DTO
(`src/types/domain.ts`) совместима с headless CMS — для подключения Strapi/Directus достаточно
заменить `src/lib/repos.ts` на запросы к API CMS, не меняя UI.

### SEO

- `metadata` + `generateMetadata` для динамических роутов.
- `sitemap.ts` собирает пути из БД (services, news) + статика.
- JSON-LD: `Organization` глобально, `BreadcrumbList`/`NewsArticle` на детальных страницах.
- `robots.ts` запрещает `/lk/` и `/api/`.

### Аналитика

`src/lib/analytics.tsx` рендерит счётчик Яндекс.Метрики только при заданном
`NEXT_PUBLIC_YANDEX_METRIKA_ID` (`<Script strategy="afterInteractive">`).

---

## Тесты

```bash
npm test              # vitest: auth, validation, format, rate-limit
npm run test:e2e      # playwright: home + auth (поднимает npm run start на :3100)
```

Перед e2e нужно собрать проект: `npm run build`.

---

## Docker

```bash
# собрать образ и поднять контейнер
docker compose up --build

# → http://localhost:3000
# БД (SQLite) сохраняется в ./data/prod.db
```

`Dockerfile` — multi-stage (deps → builder → runner) с Next.js standalone output. Entrypoint
прогоняет `prisma migrate deploy` и идемпотентный seed перед запуском сервера.

---

## Что НЕ входит в этот MVP

- Реальный платёжный шлюз (счета — read-only витрина).
- Headless CMS (схема Prisma уже готова к подключению).
- i18n (только русский).
- Тёмная тема (CSS-переменные подготовлены).
- Чат поддержки в реальном времени.
- GitHub Actions CI.
- Реальная карта покрытия (плейсхолдер `<iframe>` Яндекс.Карт через ENV).

Эти пункты — естественные точки расширения проекта.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 (beta) · Prisma + SQLite · JWT via `jose` in HttpOnly cookies · Zod · React Hook Form · Framer Motion · Vitest · Playwright. Node >= 20.

## Commands

```bash
npm run dev                       # Next dev server on :3000
npm run build                     # prisma generate && next build (standalone output)
npm run start                     # production server
npm run typecheck                 # tsc --noEmit
npm run lint                      # ESLint (next/core-web-vitals + next/typescript)
npm test                          # Vitest unit tests (src/tests/unit/**/*.test.ts)
npm run test:watch                # Vitest watch
npm run test:e2e                  # Playwright; auto-spawns `npm run start -- --port 3100`. REQUIRES `npm run build` first.
npm run prisma:migrate            # prisma migrate dev
npm run prisma:deploy             # prisma migrate deploy (prod)
npm run prisma:seed               # tsx prisma/seed.ts (idempotent)
bash scripts/build-for-beget.sh   # build production bundle into ./deploy/ for Beget Shared Node.js
bash scripts/share.sh             # cloudflared quick-tunnel wrapper (`share*` npm scripts wrap this)
```

Run a single Vitest file: `npx vitest run src/tests/unit/auth.test.ts`. A single Playwright spec: `npx playwright test src/tests/e2e/auth.spec.ts`.

`postinstall` runs `prisma generate`, so a fresh `npm install` already produces the client. First-time setup requires `cp .env.example .env`, setting `JWT_SECRET` (≥32 chars), then `npx prisma migrate dev --name init && npm run prisma:seed`. Default credentials after seed:
- B2C demo: `demo@rutega.ru` / `Demo12345!`
- Admin (matches `DEMO_USER` / `DEMO_PASS` in `.env.example`): `karim2222` / `karim22333`
- Demo gate page (`/demo-access`) uses `DEMO_USER` / `DEMO_PASS`

## Architecture

### Three-layer middleware gating (`src/middleware.ts`)

A single middleware enforces three independent gates in order — read it before changing any auth/redirect behavior:

1. **Demo gate** — when `DEMO_GATE_ENABLED !== "false"`, every path except `/demo-access*` and `/api/demo-access` requires a valid `rutega_demo` JWT cookie (HS256, signed with `DEMO_SECRET` or fallback `JWT_SECRET`, 30-day TTL). This is a basic-auth-style preview lock for the entire site.
2. **Admin gate** — `/admin/*` requires a session cookie whose JWT payload has `role === "admin"`. Authenticated non-admins are bounced to `/lk`; unauthenticated users to `/admin/login`.
3. **LK gate** — `/lk/*` (except `/lk/login`, `/lk/register`) requires any valid session.

Static paths (`/_next`, `/favicon`, `/robots.txt`, `/sitemap.xml`, `/icons/`, `/images/`) short-circuit before the gates.

Session cookie TTL is set in `src/lib/auth/cookies.ts` (`MAX_AGE_SECONDS`); `src/lib/auth/jwt.ts` only signs the JWT — the cookie's lifetime is independent of any TTL inside the token.

### Route group layout

`src/app/` uses App Router groups so each segment gets its own layout/chrome:
- `(marketing)/` — public pages: `/`, `/services` (+ `[slug]`), `/services/b2g`, `/tariffs`, `/business`, `/cases` (+ `[slug]`), `/coverage`, `/technologies`, `/about/team`, `/about/licenses`, `/about/requisites`, `/news` (+ `[slug]`, used as «Блог»), `/support`, `/contacts`, `/status`, `/legal/*`, `/thanks`.
- `(auth)/` — `/lk/login`, `/lk/register` without site chrome.
- `(account)/lk/` — protected LK with sidebar layout.
- `(admin)/admin/` — admin panel: `(protected)/` subgroup + `login/`.
- `demo-access/` — top-level page for the demo-gate login form.
- `api/` — Route Handlers: `auth/`, `me/`, `profile/`, `services/`, `news/`, `billing/`, `user-services/`, `contact/`, `leads/`, `callback/`, `cases/` (+ `[slug]`), `coverage/`, `demo-access/`, `lk/`, `v1/`, `admin/`.
- Top-level: `sitemap.ts` (built from DB), `robots.ts` (disallows `/lk`, `/api`, `/admin`, `/thanks`, `/demo-access`), `error.tsx`, `not-found.tsx`, `globals.css` (Tailwind v4 `@theme` + `.a11y` overrides).

### Auth (`src/lib/auth/`)

- `password.ts` — bcrypt cost 12.
- `jwt.ts` — HS256 sign/verify with `jose`. Payload includes `sub` (user id) and `role`. TTL of the cookie itself comes from `cookies.ts`, not jose.
- `cookies.ts` — `SESSION_COOKIE = "rutega_session"`, `HttpOnly`, `SameSite=Lax`, `Secure` in prod, 7-day `MAX_AGE_SECONDS`.
- `session.ts` — `getCurrentUser()` is `cache()`-wrapped for RSC; returns `null` if user is banned. `requireAdmin()` redirects.
- `demoGate.ts` — separate JWT for the site-wide preview lock.
- `loginPending.ts`, `totp.ts`, `twoFactor.ts`, `permissions.ts` — 2FA flow (TOTP + recovery codes) and role-based permission helpers.

When adding protected RSC pages, call `getCurrentUser()` / `requireAdmin()` rather than re-reading cookies.

### Data layer

Public marketing/admin pages funnel DB access through `src/lib/repos.ts` (catalog, cases, coverage) and `src/lib/admin/repos.ts` (admin lists). Some POST route handlers under `src/app/api/` call `prisma` directly (e.g. auth/register, leads, contact via `lib/leadDelivery.ts`) — that's an intentional pattern for write paths; reads should still go through repos.

JSON-encoded fields are stored as strings in SQLite and decoded via `parseJsonArray` (`src/lib/parseJson.ts`) — current usages: `Service.features`, `Tariff.perks`, `Case.techStack`, `Case.metrics`, `CoveragePoint.geojson`/`metadata`, `ServiceIncident.componentSlugs`/`affectedOrgIds`, `ConnectionRequest.quote`, `ApiKey.scopes`, `TwoFactor.recoveryCodes`. Follow the same pattern when adding array/object fields so PostgreSQL migration stays trivial (Prisma `Json` type maps cleanly).

`src/data/*.ts` are seed sources (`services`, `tariffs`, `news`, `cases`, `coverage`, `company`), consumed only by `prisma/seed.ts`. To swap to a headless CMS, replace `repos.ts` — DTOs in `src/types/domain.ts` are CMS-agnostic.

### Public-form pipeline (lead → CRM → email)

Three public POST endpoints accept marketing leads — `/api/leads`, `/api/contact`, `/api/callback`. They share a uniform pipeline:

1. Token-bucket rate-limit (`src/lib/rateLimit.ts`).
2. Zod parse (`src/lib/validation/{lead,contact}.ts`).
3. Honeypot check (`website` field must be empty).
4. SmartCaptcha server verify (`src/lib/captcha/smartCaptcha.ts`) — pass-through in dev when `SMARTCAPTCHA_SERVER_KEY` is unset.
5. Persist + dispatch via `src/lib/leadDelivery.ts`, which writes to `Lead` and fires Bitrix24 webhook (`src/lib/crm/bitrix24.ts`) and Unisender admin email (`src/lib/email/unisender.ts`) in parallel via `Promise.allSettled` — external failures are logged but don't fail the request.

Add a new lead source by reusing `deliverLead()` rather than duplicating CRM/email code.

### Validation & input

All inputs are parsed with Zod schemas in `src/lib/validation/{auth,contact,lead,admin}.ts`. Never `JSON.parse` request bodies directly; use `src/lib/parseJson.ts` and a Zod schema. Public POST endpoints are throttled by the in-memory token-bucket in `src/lib/rateLimit.ts` (login/register 5/5min, contact/leads/callback 3/min) and use a honeypot field. Contact and callback share the same `contact:` rate-limit bucket on purpose.

### Security headers

`next.config.ts` `headers()` applies CSP, HSTS (prod-only), `X-Frame-Options: DENY`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` to every route. The CSP whitelists Yandex.Metrika (`mc.yandex.ru`), Yandex Maps (`api-maps.yandex.ru`, `*.maps.yandex.net`, `yastatic.net`) and Yandex SmartCaptcha (`smartcaptcha.yandexcloud.net`). Extend the directives there when integrating new third-party scripts/iframes, not via inline `<meta>`.

### SEO & analytics

- Per-route `metadata` / `generateMetadata`.
- `sitemap.ts` pulls `services`, `cases`, `news` slugs from the DB and merges with the static path list (cases and B2G/coverage/technologies/about-* included). `/thanks` is excluded.
- `robots.ts` disallows `/lk/`, `/api/`, `/admin/`, `/thanks`, `/demo-access`.
- JSON-LD: `Organization` + `LocalBusiness` (`src/components/seo/LocalBusinessJsonLd.tsx`) in root layout; `BreadcrumbList`/`Article` on case detail; `BreadcrumbList`/`NewsArticle` on news detail. `FaqPageJsonLd` is available for any page with a Q&A block.
- `src/lib/analytics.tsx` renders Yandex.Metrika only when `NEXT_PUBLIC_YANDEX_METRIKA_ID` is set (via `<Script strategy="afterInteractive">`). Helper `trackGoal(name, params?)` is used by forms after successful submit (`lead_submitted`, `contact_submitted`, `callback_submitted`).

### Marketing components

- `src/components/marketing/CostCalculator.tsx` — pure-logic calculator (in `src/lib/calculator.ts`, unit-tested) for B2B/B2G price-from estimates. CTA links to `/contacts?service=…`.
- `src/components/marketing/CoverageMap.tsx` — Yandex Maps 2.1 wrapper, `dynamic({ ssr: false })`. Loads markers from `/api/coverage` (FeatureCollection).
- `src/components/marketing/CallbackModal.tsx` — header CTA, opens a `<dialog>`-based modal (`src/components/ui/Dialog.tsx`) with phone-only lead form.
- `src/components/marketing/SmartCaptcha.tsx` — Yandex SmartCaptcha widget; gracefully degrades to dev-bypass when sitekey isn't set.
- `src/components/marketing/A11yToggle.tsx` — toggles `.a11y` class on `<html>` for the «Версия для слабовидящих» B2G requirement; persisted in `localStorage`.
- `src/components/marketing/CaseCard.tsx` — listing card for `/cases`.
- `src/components/marketing/{LeadForm,ContactForm}.tsx` — share `leadSchema`/`contactSchema`. `LeadForm` has `variant: "simple" | "two-step"` (the latter adds INN/companyName step). Both render SmartCaptcha and the 152-FZ consent + optional marketing-consent checkboxes.

### UI primitives

`src/components/ui/` are custom Tailwind v4 components (NOT shadcn — Tailwind 4 beta is incompatible with shadcn CLI as of this version). `Dialog.tsx` uses the native `<dialog>` element for free focus-trap/Esc handling. New primitives should match the existing pattern (forwardRef, `cn` from `src/lib/cn.ts`, errors via aria-describedby).

### Tests

- `src/tests/unit/setup.ts` is loaded by Vitest (env: `node`, alias `@` → `src`). Unit tests cover auth, validation, format, rate-limit, calculator, billing, sla, connectionQuote, totp, permissions.
- Playwright (`src/tests/e2e/`) runs against the production build on port 3100 — always `npm run build` first.

### Deployment

- **Beget Shared Node.js** (current target): `bash scripts/build-for-beget.sh` produces `./deploy/`. Entry-point is `server.js` (Passenger), config is `.htaccess`. Step-by-step in `BEGET_DEPLOY.md`. SQLite at `./data/prod.db`.
- **Docker** (alternative, kept in repo): `Dockerfile` is multi-stage (deps → builder → runner) using Next.js standalone output. `docker/entrypoint.sh` runs `prisma migrate deploy` then the seed before starting the server. SQLite DB persists at `./data/prod.db` via the compose volume.

Both rely on `output: 'standalone'` in `next.config.ts`. If you switch to PostgreSQL, change the Prisma datasource provider, run `prisma migrate dev` to regenerate migrations, and adjust the JSON-as-string columns to use Prisma's `Json` type.

## Conventions

- TypeScript is strict; the `@/` path alias points at `src/`.
- Server-only modules import `"server-only"` to prevent client bundling — keep this on anything touching `prisma`, secrets, or external service tokens (CRM, email, captcha verify).
- Prettier with `prettier-plugin-tailwindcss` controls formatting; do not hand-reorder Tailwind classes.
- `next/typescript` ESLint rules are active — fix lint failures rather than disabling rules.
- The codebase and copy are in Russian; keep user-facing strings consistent with existing tone.
- Required env vars for marketing-MVP integrations (all optional in dev — graceful no-op when unset): `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`, `NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY`, `SMARTCAPTCHA_SERVER_KEY`, `BITRIX24_WEBHOOK_URL`, `UNISENDER_API_KEY`, `ADMIN_ALERT_EMAIL`.

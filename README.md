# Nailed It Jess — Booking Platform

A full-stack booking website for Nailed It Jess (est. 2021): a public marketing
site with an online appointment request flow, client self-service booking
management, and an admin dashboard for managing bookings, services, content,
availability, and policies.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Prisma 7** + SQLite (via `@prisma/adapter-better-sqlite3`) — swap the
  datasource for Postgres/MySQL in `prisma/schema.prisma` for production
- Cookie-based admin sessions (DB-backed), bcrypt password hashing
- Local disk file storage for uploaded images (`public/uploads`)
- Email sending is abstracted behind `src/lib/email.ts`. Without
  `RESEND_API_KEY` set, it only logs to the `EmailLog` table; with it set,
  real email goes out via [Resend](https://resend.com)
- All appointment times are business-local (Africa/Johannesburg, fixed
  UTC+2 — see `src/lib/timezone.ts`), independent of the server's own
  timezone

## Getting Started

```bash
npm install
npx prisma generate
npx prisma migrate dev   # creates ./dev.db and applies the schema
npx prisma db seed       # seeds services, settings, sample reviews, admin user
npm run dev
```

Open http://localhost:3000 for the public site, and http://localhost:3000/admin
for the dashboard.

### Admin login

Seeded by `prisma/seed.ts` (override via `ADMIN_SEED_EMAIL` /
`ADMIN_SEED_PASSWORD` env vars before seeding):

- Email: `onckekim@gmail.com`
- Password: `NailedItJess2026!`

**Change this password from a real account-management flow before going to
production** — there is currently no self-service password reset.

### Enabling online booking

Online booking stays **off** (`bookingEnabled: false`) until an admin
reviews business hours and switches it on from **Admin → Settings → Online
Booking & Availability** — this is deliberate, so the site never silently
takes bookings against unconfirmed hours. The seed script switches it on for
convenience since it also seeds real placeholder hours; a fresh
`BusinessSettings` row created any other way defaults to off.

## Project Structure

- `src/app/(site)/*` — public marketing site (home, about, services, gallery,
  policies, reviews, contact, booking wizard, `/manage/[token]` client
  self-service page)
- `src/app/admin/*` — admin dashboard (`/admin/login` is public, everything
  under `/admin/(protected)` requires a session)
- `src/app/api/*` — route handlers: public booking submission/quote, public
  token-gated `/api/manage/[token]/*`, the reminder cron endpoint, and admin
  CRUD for bookings/services/settings/gallery/reviews/clients/blocked-dates
- `src/lib/*` — shared business logic: pricing/deposit calculations, booking
  workflow + late-cancellation fee logic, auth, secure tokens, email
  templates, timezone helpers, reminders, rate limiting
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — initial services, price list, business settings, admin
  user

## Booking & Policy Logic

- Deposits, service pricing (fixed / per-nail / per-nail-or-full-set /
  per-nail range / full-set-only / range) all live in the `Service` table —
  nothing is hardcoded in the UI.
- The 50% deposit, late-cancellation window, late-cancellation fee %, and how
  a forfeited deposit interacts with a late-cancellation fee
  (`cancellationFeeMode`: forfeit satisfies the fee / an additional fee still
  applies / always manual review) are all editable from **Admin → Settings**.
- Every booking request that gets submitted records a `PolicyAcceptance` row
  (policy version, consent text, timestamp, booking, client) at submission
  time. Changing the policy text/version later never rewrites what an
  existing booking recorded.
- Every status transition (accept, propose, client accept/decline, decline,
  cancel, no-show, reschedule, complete) is recorded in
  `BookingStatusHistory`, visible in the admin booking detail panel.
- No-shows are treated as late cancellations and can optionally place a
  booking restriction on the client, which blocks new online requests until
  an admin clears it from **Admin → Clients**.
- Availability respects business hours, blocked dates (holidays/closures,
  managed in Settings), minimum notice, maximum advance booking, and a
  configurable buffer between appointments — all admin-editable.

## Client Self-Service (`/manage/[token]`)

Emails to clients (booking received, accepted, proposed time, reminders)
include a secure link to a token-gated page where they can, without an
account: view status and deposit info, accept/decline a proposed alternative
time, request cancellation (subject to the same policy logic the admin
dashboard uses), add the appointment to their calendar, and reach the studio
on WhatsApp. Tokens are random 256-bit values; only their SHA-256 hash is
stored (`BookingActionToken`), and every mutating action re-validates the
booking's current state server-side rather than relying on the token being
single-use.

## Appointment Reminders

Configurable in **Admin → Settings → Appointment Reminders** (on/off, 24h
and/or 2h before, editable message text). Reminders are sent by
`sendDueReminders()` (`src/lib/reminders.ts`), which only ever acts on
CONFIRMED bookings and is idempotent per (booking, reminder type) via
`ReminderLog` — safe to call as often as you like.

This app has no built-in scheduler, so nothing calls that function on its
own. Point an external scheduler at `GET /api/cron/reminders` (hourly is
plenty) with a `CRON_SECRET` you set:

```
Authorization: Bearer <CRON_SECRET>
```

(or `?secret=<CRON_SECRET>` if your scheduler can't set headers). Options:
Vercel Cron (`vercel.json` `crons` entry), a GitHub Actions
`schedule:` workflow, or a third-party pinger like cron-job.org.

## Notes for Production / Deliberately Deferred

Built directly into the app: everything above. A few things were
**intentionally not built**, either because they need infrastructure/
credentials this environment doesn't have, or because they'd mean rewriting
already-working, already-deployed functionality rather than adding to it:

- **Supabase migration.** The data layer stays on Prisma (SQLite here,
  designed to swap to Postgres/MySQL by changing the datasource + driver
  adapter in `src/lib/prisma.ts`/`prisma/seed.ts`). Supabase-specific
  features (its Auth, Storage, Postgres RLS) were not adopted — that would
  be a full rewrite of the data/auth/storage layers, not an addition to what
  already ships, and needs a Supabase project + service key this session
  doesn't have.
- **Real payment gateway.** Deposits/balances are still recorded manually as
  EFT. The `depositStatus` state machine is shaped so a gateway webhook can
  drive the same transitions later without a rebuild.
- **DB-level appointment overlap constraints.** Conflict checking happens in
  application code (`findConflict` in `src/lib/booking-service.ts`), not as
  a database exclusion constraint — SQLite doesn't support those. A
  production Postgres deployment under real concurrent load should add a
  proper exclusion constraint (or serializable transaction) rather than
  relying solely on the application check.
- **Multi-instance rate limiting.** `src/lib/rate-limit.ts` is a best-effort,
  single-process in-memory limiter on booking submission, uploads, and admin
  login. It won't share state across multiple serverless instances — move to
  a shared store (e.g. Upstash Redis) if traffic warrants it.
- **A cross-entity admin audit log.** Status changes on bookings are fully
  audited (`BookingStatusHistory`); edits to services/settings/gallery/etc.
  are not separately logged.
- Uploaded images are written to `public/uploads` on local disk — move this
  to object storage (S3, R2, etc.) for a multi-instance deployment.

# Nailed It Jess — Booking Platform

A full-stack booking website for Nailed It Jess (est. 2021): a public marketing
site with an online appointment request flow, and an admin dashboard for
managing bookings, services, content, and policies.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Prisma 7** + SQLite (via `@prisma/adapter-better-sqlite3`) — swap the
  datasource for Postgres/MySQL in `prisma/schema.prisma` for production
- Cookie-based admin sessions (DB-backed), bcrypt password hashing
- Local disk file storage for uploaded images (`public/uploads`)
- Email sending is abstracted behind `src/lib/email.ts` and currently logs to
  an `EmailLog` table instead of sending real email — swap in a real
  provider (Resend, SES, SMTP) there without touching booking logic

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

## Project Structure

- `src/app/(site)/*` — public marketing site (home, about, services, gallery,
  policies, reviews, contact, booking wizard)
- `src/app/admin/*` — admin dashboard (`/admin/login` is public, everything
  under `/admin/(protected)` requires a session)
- `src/app/api/*` — route handlers (public booking submission + quote, admin
  CRUD for bookings/services/settings/gallery/reviews/clients)
- `src/lib/*` — shared business logic: pricing/deposit calculations, booking
  workflow + late-cancellation fee logic, auth, email templates
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
  time.
- No-shows are treated as late cancellations and can optionally place a
  booking restriction on the client, which blocks new online requests until
  an admin clears it from **Admin → Clients**.

## Notes for Production

- Move the SQLite datasource to a managed Postgres/MySQL instance and update
  the driver adapter in `src/lib/prisma.ts` and `prisma/seed.ts`.
- Wire a real email provider into `src/lib/email.ts`.
- Uploaded images are written to `public/uploads` on local disk — move this
  to object storage (S3, R2, etc.) for a multi-instance deployment.
- Add a real online payment gateway alongside the existing manual EFT deposit
  recording — the `depositStatus` state machine (`NOT_REQUIRED` →
  `AWAITING_DEPOSIT` → `DEPOSIT_SUBMITTED` → `DEPOSIT_PAID` / `DEPOSIT_FAILED`
  / `DEPOSIT_REFUNDED` / `DEPOSIT_FORFEITED`) was designed so a gateway
  webhook can drive the same transitions the admin dashboard drives manually
  today.

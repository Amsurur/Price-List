# 08 — Tech Stack & Setup

Chosen to give **real, saved data**, **admin login**, and **image hosting** with minimal ops for a solo owner, on generous free tiers, and to be a stack Claude Code builds smoothly.

## Stack

- **Next.js (App Router) + TypeScript** — one codebase for storefront, admin, and server logic (route handlers). SSR/ISR where useful.
- **Tailwind CSS** — styling via the tokens in `05-design-system.md`. Fonts: Space Grotesk + Inter.
- **Supabase** — Postgres (data), Auth (admin login), Storage (product images), and Row Level Security. Replaces building a separate backend + auth + file server.
- **Vercel** — hosting + CI from Git. Free tier is enough to launch.

### Why not simpler / heavier
- A no-backend static build can't save data or protect an admin — this shop needs both, so Supabase earns its place.
- Avoid heavier setups (custom Node server, separate DB host, hand-rolled auth) — unnecessary for this scope and more to maintain.
- If the owner ever wants an even lighter start, the *only* acceptable shortcut is deferring auth polish — not skipping the database. Persisted data is non-negotiable (the prototype's export/import was a stopgap for exactly this).

## Suggested structure

```
softclub-store/
  app/
    (store)/                # public storefront
      page.tsx              # store page (grid, unlock, filters)
      reserve/              # reserve flow (or a modal within page)
    admin/
      login/
      products/
      codes/
      reservations/
      layout.tsx            # auth guard + admin shell
    api/                    # route handlers
      validate-code/        # server-side code validation (never expose the table)
      reservations/         # create reservation
  components/
    store/                  # ProductCard, UnlockBar, ReserveForm, Filters...
    admin/                  # ProductForm, CodeList, ReservationRow, StatsStrip...
    ui/                     # Button, Input, Chip, Badge, Modal, Seal...
  lib/
    supabase.ts             # clients (browser + server/service where needed)
    pricing.ts              # effectiveDiscount, memberPrice, saving  (single source)
    codes.ts                # validateCode, generateCode(s)
    reservations.ts         # createReservation, status transitions
    format.ts               # currency + number formatting
    types.ts                # shared TS types matching the data model
  supabase/
    schema.sql              # tables + RLS from 03-data-model.md
    seed.ts                 # sample products + codes
  tailwind.config.ts
  CLAUDE.md
  Roadmap.md
  docs/
```

## Environment

`.env.local` (never commit):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — for the validate-code endpoint and admin writes; never sent to the browser)
- `NEXT_PUBLIC_CURRENCY` (default `$`)

## Setup steps (M0)

1. `npx create-next-app@latest softclub-store --typescript --tailwind --app`
2. Add Space Grotesk + Inter; extend `tailwind.config` with the design tokens.
3. Create a Supabase project; run `supabase/schema.sql`; enable RLS policies per `03-data-model.md`.
4. Add `lib/supabase.ts` (browser client with anon key; a server client using the service role for privileged operations).
5. Wire env vars; deploy to Vercel; confirm the blank styled app is live.
6. Run the seed script so development screens have data.

## Security notes

- The storefront must **never** query `student_codes` directly. Code validation goes through `api/validate-code` (or a Supabase RPC) using the service role, returning only `{ ok, student_name, discount }`.
- RLS: public read of active products only; reservations insert-only from the public side; codes and reservation reads/updates admin-only.
- Snapshot product name + price on reservations (see `03`/`04`).
- Keep the pricing and code logic in `lib/` and unit-test the maths (rounding, extra discount stacking on standard discount, out-of-stock, completed→stock-decrement idempotency).

## Testing (light but real)

- Unit-test `pricing.ts` and `codes.ts` (the rules that must never drift).
- Manually walk the golden journey on mobile and desktop before each milestone is called done.

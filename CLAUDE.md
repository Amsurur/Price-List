# CLAUDE.md

Project instructions for Claude Code. Read this first, every session.

## What this is

**Softclub Store** — a two-sided web app. A public **storefront** where Softclub students browse computer hardware, enter a **unique personal code** to unlock a member discount, and **reserve** items for pickup. And a private **admin dashboard** where the shop owner manages products, student codes, and reservations. **No online payment** — sales are finished in person at the shop.

## The golden rule

Every change must help a student go from *"I need a laptop"* to *"I bought it from us."* If a feature doesn't serve that, it waits. Ship small, working slices. Don't build ahead of the current milestone in `documents/Roadmap.md`.

## Read these before coding

- `documents/Roadmap.md` — the plan, milestones, and locked decisions. **Start here.**
- `documents/01-product-spec.md` … `documents/08-tech-stack.md` — the detail. Open the one that matches what you're building.

> Note: the spec docs live in **`documents/`** (not `docs/`). Where a spec file says `docs/…`, read it as `documents/…`.

## Stack override (important — differs from the spec)

The spec (`documents/08-tech-stack.md`) mandates **Next.js + Supabase**. We are **not using Supabase.** The chosen stack is:

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS v4 — in `apps/web`. Calls the API over REST.
- **Backend:** Node.js + **NestJS** (REST) — in `apps/api`.
- **Database:** **PostgreSQL + TypeORM** (Postgres runs locally via `docker-compose.yml`).
- **Repo:** npm-workspaces monorepo (`apps/web`, `apps/api`). Spec docs stay in `documents/`.

Because Supabase is gone, the things it bundled become **our** responsibility in later milestones — do not assume they exist:

- **Auth** (admin login) → build in NestJS (e.g. JWT + a guard on admin routes). M1.
- **Storage** (product images) → local disk / static serving for dev; revisit hosted storage later. M1.
- **Row Level Security** → enforced in NestJS guards/services, not the DB. Ongoing.
- **Deployment** (spec said Vercel) → Vercel can't host NestJS as-is; decide hosting at launch. M5.

Everything else in the spec (data model, business logic, design system, screens, features) still applies as written.

## Locked decisions (don't re-open without asking)

- Reserve-and-pickup only. No payment gateway in v1.
- One unique code per student = verification **and** discount **and** tracking.
- Solo operator. The academy is not part of the app.
- Codes are reusable but tracked and can be disabled.
- Store is browsable and reservable at regular price without a code; the code unlocks the member price on a reservation.

## Conventions

- TypeScript everywhere; no `any` unless truly unavoidable (leave a comment if so).
- Styling: Tailwind utilities + the design tokens in `apps/web/src/app/globals.css` (from `documents/05-design-system.md`). No inline hex colours — use the tokens (`bg-brand`, `text-ink`, `bg-save-tint`, …).
- Keep components small and named for what the user sees (`ReserveButton`, not `SubmitHandler`).
- Server logic (pricing, code validation, reservations) lives once in the **API** (`apps/api`) and is the single source of truth — never duplicate the discount maths in the web app.
- Snapshot product name + price onto a reservation when it's created, so later edits don't change history.
- Money is stored as integers; percentages are integers 0–90 (see `documents/03-data-model.md`).

## Working style

- Prefer boring, correct, readable code over clever code.
- Ask before adding a new dependency or changing a locked decision.
- After each milestone, stop and confirm it works end-to-end (desktop + mobile) before starting the next.
- Every screen needs empty, loading, and error states. Copy follows the writing rules in `documents/05-design-system.md`: plain, active voice, sentence case, no apologies in errors.

## Running the app

- **`/start`** — brings up Postgres (Docker), the NestJS API, and the Next.js web app.
- **`/stop`** — stops the dev servers (and the DB).
- Manual: `npm run db:up` · `npm run dev:api` · `npm run dev:web`.
- URLs: web `http://localhost:3000` · API `http://localhost:3001/api` · health `http://localhost:3001/api/health`.
- Env: copy `.env.example` → `.env` at the repo root (git-ignored). One `.env` drives web + api + docker.

## Definition of Done

Works on mobile and desktop · has empty/loading/error states · keyboard-accessible with visible focus · matches the design system · stays within the current milestone's scope.

# CLAUDE.md

Project instructions for Claude Code. Read this first, every session.

## What this is

**Softclub Store** — a two-sided web app. A public **storefront** where Softclub students browse computer hardware, enter a **unique personal code** to unlock a member discount, and **reserve** items for pickup. And a private **admin dashboard** where the shop owner manages products, student codes, and reservations. **No online payment** — sales are finished in person at the shop.

## The golden rule

Every change must help a student go from *"I need a laptop"* to *"I bought it from us."* If a feature doesn't serve that, it waits. Ship small, working slices. Don't build ahead of the current milestone in `Roadmap.md`.

## Read these before coding

- `Roadmap.md` — the plan, milestones, and locked decisions. **Start here.**
- `docs/01-product-spec.md` … `docs/08-tech-stack.md` — the detail. Open the one that matches what you're building.

## Locked decisions (don't re-open without asking)

- Reserve-and-pickup only. No payment gateway in v1.
- One unique code per student = verification **and** discount **and** tracking.
- Solo operator. The academy is not part of the app.
- Codes are reusable but tracked and can be disabled.
- Store is browsable at regular price; the code unlocks the member price and the Reserve button.

## Tech + conventions

- Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, Storage)**, deployed on **Vercel**. Full rationale and structure in `docs/08-tech-stack.md`.
- TypeScript everywhere; no `any` unless truly unavoidable (leave a comment if so).
- Styling: Tailwind utilities + the design tokens defined in `docs/05-design-system.md`. No inline hex colours — use the tokens.
- Keep components small and named for what the user sees (`ReserveButton`, not `SubmitHandler`).
- Server logic (pricing, code validation, reservations) lives in one place and is reused by both UI and API — never duplicate the discount maths.
- Snapshot product name + price onto a reservation when it's created, so later edits don't change history.

## Working style

- Prefer boring, correct, readable code over clever code.
- Ask before adding a new dependency or changing a locked decision.
- After each milestone, stop and confirm it works end-to-end (desktop + mobile) before starting the next.
- Every screen needs empty, loading, and error states. Copy follows the writing rules in `docs/05-design-system.md`: plain, active voice, sentence case, no apologies in errors.

## Commands (fill in as the project is scaffolded)

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint / typecheck: `npm run lint` / `npm run typecheck`

## Definition of Done

Works on mobile and desktop · has empty/loading/error states · keyboard-accessible with visible focus · matches the design system · stays within the current milestone's scope.

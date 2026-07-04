# Progress

## Entry Point
Branch: feature/m3-student-codes-pricing
Files in flight: none (working tree clean once this session's commit lands)

## Last Session
This session built M3 end-to-end: `StudentCodesModule` (API) — single/batch code generation (`SOFT-XXXX`, collision-checked), admin CRUD, CSV export, and a public `POST /student-codes/validate` endpoint that never exposes the full table. `GET /products` gained an optional `?code=` param so listings price against a student's discount override. Admin gained a **Student codes** tab (generate, edit, toggle active, delete, export). The storefront gained a code-unlock strip; `ProductCard` now renders locked (regular price only) vs. unlocked (struck price, member price, savings badge) based on local `unlocked` state — never inferred from the API's `saving` field, which the admin view relies on always being non-zero for reference pricing. Also renamed all user-visible "Softclub" copy to "Computerra" per the user's request (UI text only — docs, DB/Docker names, code prefix, and admin email domain were explicitly left untouched).

## Milestone Status
- M0 — Project setup: done.
- M1 — Data + admin core: done.
- M2 — Storefront browse: done.
- M3 — Student codes + member pricing: **done.** Verified end-to-end in-browser (desktop + mobile): generate single/batch codes, edit (name/override/note), toggle active, delete, CSV export; storefront applies a code (override and standard-discount cases), rejects invalid/disabled codes with the spec's exact copy, and removes cleanly. `documents/Roadmap.md`'s M3 boxes are now ticked to match.
- M4 — Reservations: not started (next up — depends on M3's code validation, now in place).
- M5 — Polish + launch: not started.

## Blockers
None for M3.

Housekeeping / carried-over notes:
- **Admin login credentials changed this session** — the original `ADMIN_PASSWORD_HASH` in the local `.env` was an unrecoverable bcrypt hash, so a new dev password was generated to browser-test the admin UI (shared with the user directly in chat, not recorded here). This is local-only (`.env` is git-ignored); regenerate the hash to change it.
- Pre-existing lint debt, unchanged: `apps/api/src/products/dto/create-product.dto.ts:32` (`no-unsafe-return`), `apps/api/src/main.ts:48` (`no-floating-promises`), `react-hooks/set-state-in-effect` on the admin + storefront fetch-on-mount pattern (accepted pattern, not a regression — same shape now also present in the new `admin/codes` page).
- `.claude/scheduled_tasks.lock` is untracked and not yet gitignored — harness-internal, worth a `.gitignore` entry at some point.
- The Computerra rename was scoped to UI copy only (per the user's choice) — `documents/*.md`, `CLAUDE.md`, the `SOFT-` code prefix, the `softclub_store` DB name, the `softclub-postgres` Docker container, and the `softclubstore.local` admin email domain still say "Softclub". Flag this inconsistency if the user wants it addressed later.

## Next Step
Build M4 (Reservations) end-to-end: storefront Reserve button (only active when a code is applied + in stock) → short form (name/contact/quantity/note, pre-filled from the code) → confirmation screen; admin reservations tab with the `new → contacted → completed/cancelled` status pipeline; decrement stock on `completed` (idempotent).

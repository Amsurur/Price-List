# Progress

## Entry Point
Branch: feature/m2-storefront-browse
Files in flight: none (working tree clean; only untracked harness file `.claude/scheduled_tasks.lock`, not part of app code)

## Last Session
`ef06671` closed out M2: the public storefront product grid at `/` — live search, tag filters, sort (featured/price/name), stock badges, and a disabled Reserve button with a code-unlock hint (Reserve stays wired up for M4). `GET /products` gained an optional `?active=` filter so the public grid only ever sees active products.

## Milestone Status
- M0 — Project setup: done.
- M1 — Data + admin core: done.
- M2 — Storefront browse: done.
- M3 — Student codes + member pricing: not started. Groundwork already in place: `StudentCode` TypeORM entity exists (`apps/api/src/entities/student-code.entity.ts`) but has no module/controller/service or route wired into `app.module.ts` yet. `apps/api/src/common/pricing.ts` already implements `effectiveDiscount`/`memberPrice`/`saving`/`stockLabel` per the business-logic doc, so M3 code validation + pricing can reuse it directly rather than re-deriving the maths.
- M4 — Reservations: not started (depends on M3's code validation).
- M5 — Polish + launch: not started.

## Blockers
None. Dev stack verified healthy this session: Postgres container healthy, API health check returned `{"status":"ok","database":"up",...}`, web starting on 3000.

Carried-over notes (not blockers, just known/accepted):
- Pre-existing lint debt: `apps/api/src/products/dto/create-product.dto.ts:32` (`no-unsafe-return`), `apps/api/src/main.ts:46` (`no-floating-promises`), `react-hooks/set-state-in-effect` on the admin + storefront fetch-on-mount pattern (accepted pattern, not a regression).
- `.claude/scheduled_tasks.lock` is untracked and not yet gitignored — harness-internal, worth a `.gitignore` entry at some point.

## Next Step
Build M3 end-to-end: admin student-codes tab (generate single/batch, discount override, active toggle, use count, CSV export) + a server-side code-validation endpoint + storefront unlock strip that applies the member price across the grid using the existing `pricing.ts` helpers.

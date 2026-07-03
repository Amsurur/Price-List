# Progress

## Entry Point
Branch: feature/m2-storefront-browse
Files in flight: M2 storefront feature — API (`apps/api/src/products/products.service.ts`, `products.controller.ts`), web (`apps/web/src/app/page.tsx` rewritten, `apps/web/src/lib/api.ts`, new `apps/web/src/components/store/**`, deleted `apps/web/src/components/health-status.tsx`), `documents/Roadmap.md` M2 checkboxes — all uncommitted.

## Last Session
`bbaf7ff` closed out M1 (admin login + guarded `/admin`). This session built M2: the public storefront product grid at `/` — live search, tag filters, sort (featured/price/name), stock badges, and a disabled Reserve button with a code-unlock hint (Reserve stays wired up for M4).

## Milestone Status
- M0 — Project setup: **done**.
- M1 — Data + admin core: **done**.
- M2 — Storefront browse: **done**. `GET /products` gained an optional `?active=` filter (service + controller) so the public grid only ever receives `active: true` products, matching the data model's public-read RLS intent while admin's existing unfiltered view is untouched. The homepage (`apps/web/src/app/page.tsx`) now fetches once via `listProducts({ active: true })` and does client-side search/tag/sort (same pattern as the admin products page), rendering `ProductCard`/`TagFilterChips`/`SortSelect`/`ProductGridSkeleton` (new, under `apps/web/src/components/store/`). Verified in-browser: search, tag filter, price/name sort, out-of-stock and low-stock badges, no-results + reset, and hiding a product in admin correctly removes it from the storefront. `documents/Roadmap.md`'s M2 boxes are now ticked to match.
- M3 — Student codes + member pricing: not started.
- M4 — Reservations: not started.
- M5 — Polish + launch: not started.

## Blockers
- None for M2. Last session's port-3000 conflict (an unrelated Vite dev server squatting the port) is no longer present — the storefront served correctly on `localhost:3000` throughout this session's browser verification.
- Mobile-width visual confirmation was skipped (the browser tool's `resize_window` didn't affect this session's screenshot capture), but the grid uses native CSS `auto-fill, minmax(250px, 1fr)`, which collapses columns by rendered width regardless of JS breakpoints — low risk.
- Pre-existing lint debt, untouched: `apps/api/src/products/dto/create-product.dto.ts:32` (`no-unsafe-return`), `apps/api/src/main.ts:46` (`no-floating-promises`), and the `react-hooks/set-state-in-effect` rule on the admin products page's fetch-on-mount pattern. This session's new `apps/web/src/app/page.tsx` inherits that same `set-state-in-effect` flag for its own fetch-on-mount (the rule flags the effect calling any function that eventually calls a setter, even after an `await`) — fixing it properly would mean redesigning data-fetching as a Server Component, a bigger architectural change than this session's scope. Noting it as the same accepted pattern already tolerated in the admin page, not a new regression.
- Minor housekeeping (not part of this session's diff): `.claude/scheduled_tasks.lock` is untracked and not yet gitignored — a harness-internal file, worth a `.gitignore` entry at some point so it doesn't get swept into a future `git add -A`.
- Unrelated: the installed `dotenv@17.4.1` package prints a random self-promo "tip" on every load, one of which points to an unfamiliar domain (`vestauth.com`). No exfiltration code found nearby (checked `node_modules/dotenv/lib/main.js`) — likely the same maintainers' known (if spammy) tips feature, not tampering, but flagged for awareness since it wasn't independently verified.

## Next Step
M2 is done — pick M3 (student codes + member pricing: admin code generation/CSV export, storefront code entry that unlocks member pricing across the grid) as the next session's feature. The M2 `ProductCard`'s price block and the "Have a Softclub code?" hint line were built with M3's unlock strip in mind (per the storefront spec), so M3 should slot in without reworking the card layout.

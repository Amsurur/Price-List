# Progress

## Entry Point
Branch: feature/m5-polish-launch
Files in flight: all changes below are uncommitted on this branch — ready to review/commit.

## Last Session
This session built M5 (Polish + launch) end-to-end:
- New **admin dashboard home** (`admin/(dashboard)/page.tsx`) with stat cards (products, in-stock, active codes, open reservations), each linking to its tab. Login and the admin logo now route to `/admin` instead of `/admin/products`.
- **Error-state audit**: added a global branded `not-found.tsx` and `error.tsx` (neither existed before); the product edit page's error handling used to call `notFound()` for *any* failure (including a down API) — it now distinguishes a real 404 from a transient failure via a new `ApiError` class (`lib/api.ts`) that carries the HTTP status, and shows a proper retry state for the latter.
- **Accessibility pass**: found and fixed ~20 buttons/links across `code-row.tsx`, `reservation-row.tsx`, `generate-code-panel.tsx`, `product-form.tsx`, `reserve-form.tsx`, and three admin pages that were missing `focus-visible` outlines — keyboard users tabbing through were getting no visible focus ring. `prefers-reduced-motion` was already handled globally in `globals.css`.
- **Responsive fix**: the admin top bar (`admin/(dashboard)/layout.tsx`) had no wrap/scroll handling on its single-row flex layout; adding a 4th tab (Dashboard) would have made mobile overflow worse. Reworked it to wrap onto two rows on narrow screens with a horizontally-scrollable tab strip on `sm:` and below.
- **Low-stock badges**: confirmed already built in a prior session (`stockLabel()` in `apps/api/src/common/pricing.ts`), wired into both storefront and admin. Verified via the pricing test suite (14/14 passing, covering the 0 / 1–3 / 4+ boundaries) and a live `GET /products` call showing correct labels.
- **Owner guide** written at `documents/09-owner-guide.md`: logging in, adding a product, generating/handing out/disabling a code, working a reservation to completed, and the (manual, pre-QR-generator) process for printing a QR to the store.
- `documents/Roadmap.md`'s M5 boxes are now ticked; the "Done when" line notes the loop is verified locally but hosted deploy is still open.

**Caveat:** no browser extension was available this session, so the UI was verified via `next build`, full test suites, live `curl` smoke checks of every route, and a live API check of stock labels — not a visual/interactive walkthrough. Worth a manual look in an actual browser (desktop + mobile) before calling M5 fully signed off.

## Milestone Status
- M0 — Project setup: done.
- M1 — Data + admin core: done.
- M2 — Storefront browse: done.
- M3 — Student codes + member pricing: done.
- M4 — Reservations: done.
- M5 — Polish + launch: **done** except the hosted deploy (deferred per the stack override in root `CLAUDE.md` — Vercel can't host NestJS as-is, hosting decision still open).

## Blockers
None for the work done this session. Open item: no browser was available to visually confirm the accessibility/responsive fixes — recommend a real click-through (especially the reworked admin top bar on a narrow viewport) before shipping.

Housekeeping / carried over, unaddressed (not blocking):
- Pre-existing lint debt, unchanged: `apps/api/src/products/dto/create-product.dto.ts:32` (`no-unsafe-return`), `apps/api/src/main.ts:48` (`no-floating-promises`), `react-hooks/set-state-in-effect` on every fetch-on-mount page (now also present in the new admin dashboard page — same accepted pattern, not a regression; confirmed by diffing lint output against the pre-session commit, which had the identical 9 problems).
- `.claude/scheduled_tasks.lock` still untracked and not gitignored.
- The Computerra rename is still UI-copy-only — `documents/*.md`, `CLAUDE.md`, the `SOFT-` code prefix, the `softclub_store` DB name, `softclub-postgres` Docker container, and `softclubstore.local` admin email domain still say "Softclub."
- **Local dev admin password changed again this session** (same as last session's note) — the `.env` `ADMIN_PASSWORD_HASH` was regenerated to a new dev-only password so routes could be smoke-tested; shared with the user in chat, not recorded here. `.env` is git-ignored.

## Next Step
M5 is functionally complete; the two things left before "launch" are: (1) a real browser click-through of this session's changes (desktop + mobile) since none was available this session, and (2) deciding + doing the hosted deploy (Vercel can't host NestJS — needs a hosting decision for both `apps/api` and `apps/web`, plus Postgres). Recommend starting the next session with the browser check, then scoping the deploy as its own session.

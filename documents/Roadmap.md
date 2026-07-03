# Softclub Store — Roadmap

> **This is the file to keep open.** It is the single source of truth for *what* we build, *in what order*, and *when a thing is done*. Every detail lives in `/docs`. Read `CLAUDE.md` first, then this file, then the doc for whatever you're building.

---

## 1. The one goal (never lose this)

**Turn a Softclub student who needs equipment into someone who buys it from the shop — instead of losing them.**

Every feature must pass one test: *does it help a student go from "I need a laptop" to "I bought it from us"?* If it doesn't, it waits or gets cut. This is what keeps the project shippable.

## 2. What we are building (in one paragraph)

A small web app with **two sides**. A public **storefront** where Softclub students browse hardware (laptops, PCs, printers, accessories) at regular prices, enter a **unique personal code** to unlock their member price, and **reserve** an item. And a private **admin dashboard** where the shop owner manages products, generates and tracks student codes, and works through reservations. There is **no online payment** — the app captures the student and the item; the sale is finished in person at the shop.

## 3. Locked decisions

These were already decided with the client. Do not re-open them without asking.

| Decision | Choice |
|---|---|
| How a student buys | **Reserve online → pay & pick up at the shop.** No online payment in v1. |
| How a student proves they're from Softclub | **A unique code per student.** The same code also applies their discount and lets the owner see who is shopping. |
| Who runs the app | **The shop owner alone.** Softclub (the academy) is *not* part of the app. |
| Are codes single-use? | **No — reusable** by that one student, but every use is tracked and the owner can switch a code off instantly. |
| Is the store locked? | **No.** Anyone can browse at regular price. The code unlocks the *member price* and the *Reserve* button. |
| Stock behaviour | Reservations do **not** hold stock automatically. Stock decreases when a reservation is marked **completed**. |

## 4. Documentation map

Build order roughly follows this list. Read the doc before writing the code for that area.

1. `docs/01-product-spec.md` — vision, users, journeys, scope (in vs out).
2. `docs/02-features.md` — every feature with acceptance criteria (the checklist source).
3. `docs/03-data-model.md` — tables, fields, relationships, sample data.
4. `docs/04-business-logic.md` — discount maths, code validation, reservation lifecycle, stock rules (with pseudocode).
5. `docs/05-design-system.md` — colours, type, components, the look to match.
6. `docs/06-admin-dashboard.md` — admin screens, field by field.
7. `docs/07-storefront.md` — storefront screens and states.
8. `docs/08-tech-stack.md` — stack, project structure, setup, deploy.

## 5. Milestones

Ship each milestone as a working, deployed slice. Don't build ahead.

### M0 — Project setup
- [x] Scaffold the app per `docs/08-tech-stack.md` (Next.js + TypeScript + Tailwind).
- [ ] ~~Create the Supabase project; wire up env vars; confirm the app builds and deploys to Vercel~~ — N/A under the stack override in `CLAUDE.md` (Postgres + TypeORM + NestJS, no Supabase); hosted deploy is deferred to M5.
- [x] Add design tokens from `docs/05-design-system.md` to the Tailwind config.
- **Done when:** a blank but styled app is live on a URL. *(Runs locally; no public URL yet — that's M5.)*

### M1 — Data + admin core
- [x] Create DB tables from `docs/03-data-model.md` (products, student_codes, reservations).
- [x] Admin login (JWT + guard per the `CLAUDE.md` stack override, not Supabase Auth — single owner account via env credentials). Everything under `/admin` is protected.
- [x] Products: list, add, edit, delete, with all fields (image upload to local disk, not Supabase Storage — per stack override).
- **Done when:** the owner can log in and fully manage the product catalogue. ✅

### M2 — Storefront browse
- [x] Product grid pulling live products, showing **regular** prices only.
- [x] Search, filter by tag, sort by price. Stock / "out of stock" states.
- **Done when:** a visitor can browse the real catalogue with no code. ✅

### M3 — Student codes + member pricing
- [ ] Admin: generate codes (single or batch), set per-student discount override, activate/deactivate, view use count, **export list** (CSV).
- [ ] Storefront: code entry that validates a code and unlocks the member price on every product (logic in `docs/04-business-logic.md`).
- [ ] Each product card shows regular price struck out, member price, and savings once unlocked.
- **Done when:** a valid code changes prices; an invalid or disabled code is politely rejected.

### M4 — Reservations
- [ ] Storefront: **Reserve** button (only active when a code is applied) → short form (name + contact, pre-filled from code) → confirmation screen.
- [ ] Admin: reservations list with status `new → contacted → completed / cancelled`, filters, and the code/student attached.
- [ ] On **completed**, decrement stock.
- **Done when:** a reservation made in the shop appears in admin and can be worked to "completed".

### M5 — Polish + launch
- [ ] Design pass against `docs/05-design-system.md`; responsive + accessible (keyboard focus, reduced motion).
- [ ] Empty states, error states, loading states (see writing rules in the design doc).
- [ ] Low-stock badges; simple admin dashboard stats (products, in-stock, active codes, open reservations).
- [ ] Owner guide: how to add products, hand out codes, print a QR to the store.
- **Done when:** the owner can run the whole loop end-to-end and the app is live.

## 6. Later (Phase 2 / 3 — do NOT build yet)

Keep these out of v1. They're listed so nothing gets forgotten.

- **Phase 2:** "notify me when back in stock"; promo *campaign* codes (shared, with expiry + usage caps) stacking on the member price; product detail pages with full specs + a "compare laptops" tool; a real analytics dashboard; QR generator in-app; Telegram/WhatsApp notification when a reservation arrives.
- **Phase 3:** online payment / deposit / installments; course bundles ("Design course → recommended kit at a package price"); referral rewards; student reviews; repair/service booking and trade-in; opening the store to other academies.

## 7. Definition of Done (applies to every task)

A task is done only when: it works on desktop **and** mobile; empty/loading/error states exist; it's keyboard-accessible with visible focus; it matches the design system; and it doesn't add scope beyond the milestone. Prefer small, boring, correct code over clever code.

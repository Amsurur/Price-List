# 02 — Features & Acceptance Criteria

Each feature is a checklist. A feature is done when every box is true. Grouped by area. **F# = v1. P2/P3 = later, do not build.**

## Storefront (student side)

### F1 — Browse catalogue
- [ ] Products load from the database as a responsive grid of cards.
- [ ] Each card shows: image (or a clean placeholder), name, short description, tags, and price.
- [ ] Out-of-stock items are clearly marked; low stock shows "Only N left".

### F2 — Search, filter, sort
- [ ] A search box filters by name, description, tag, and category (live).
- [ ] Tag chips filter the grid; "All" resets.
- [ ] Sort by: featured, price low→high, price high→low, name A–Z.

### F3 — Unlock member price with a code
- [ ] A visible prompt invites the student to enter their code.
- [ ] Entering a **valid, active** code unlocks the member price on every eligible product and greets the student by name.
- [ ] An invalid code shows "That code isn't valid." A disabled code shows "That code has expired." (No blank failures.)
- [ ] The applied state is clearly shown, with a way to remove/clear it.
- [ ] Prices, savings, and badges update per product (see maths in `04-business-logic.md`).

### F4 — Reserve an item
- [ ] The **Reserve** button is disabled until a valid code is applied (tooltip explains why).
- [ ] Reserving opens a short form: name + contact, pre-filled from the code; optional quantity/note.
- [ ] On submit, a reservation is created and the student sees a clear confirmation ("Reservation received — the shop will contact you").
- [ ] The member price and product details are snapshotted onto the reservation at this moment.

## Admin (owner side)

### F5 — Login & protection
- [ ] `/admin/*` requires authentication (Supabase Auth). Unauthenticated users are redirected to login.
- [ ] A single owner account is sufficient for v1.

### F6 — Manage products
- [ ] List all products with search + tag filter.
- [ ] Add / edit a product: name, category, tags, regular price, member discount %, stock, image, description, active flag.
- [ ] Image upload to storage with a live preview; a missing image falls back to the placeholder.
- [ ] Delete (with confirm). Editing never breaks past reservations (snapshots protect them).

### F7 — Manage student codes
- [ ] Generate a single code or a **batch** (e.g. "create 20"); codes are unique and readable.
- [ ] Each code has: the code string, student name (optional), an optional extra discount % that stacks on top of each product's own, active toggle, note, and a use count.
- [ ] Toggle a code off to instantly disable it in the store.
- [ ] **Export** the list of codes (CSV) to hand out to students.

### F8 — Reservations queue
- [ ] List reservations newest-first with student name, item, member price, contact, and time.
- [ ] Status pipeline: `new → contacted → completed`, plus `cancelled`.
- [ ] Filter by status. Marking **completed** decrements the product's stock.

### F9 — Dashboard stats (light)
- [ ] Top-of-admin counters: total products, items in stock, active codes, open (new/contacted) reservations.

## Cross-cutting (quality gate for every screen)

### F10 — States, responsiveness, accessibility
- [ ] Empty, loading, and error states for every list and form.
- [ ] Works on mobile (single column) and desktop.
- [ ] Keyboard-navigable, visible focus rings, `prefers-reduced-motion` respected.
- [ ] Copy follows the writing rules in `05-design-system.md`.

---

## Later — do not build in v1

- **P2:** notify-when-back-in-stock · shared promo campaign codes (expiry + max uses, stacking on member price) · product detail pages + compare tool · analytics dashboard · in-app QR generator · Telegram/WhatsApp reservation alerts.
- **P3:** online payment / deposit / installments · course bundles · referral rewards · reviews · repair booking + trade-in · multi-academy.

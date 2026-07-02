# 07 — Storefront

Public, no login. The Softclub student's whole experience. Everything here serves the golden rule: get them from browsing to a reservation.

## Store page (`/`)

### Top bar
- Brand + seal. Keep it simple; no cart (there's no checkout — reservations are one item at a time in v1, or a simple list; start with per-item Reserve).

### Unlock strip (the code moment)
- A prominent brand-coloured band: "Softclub student? Enter your code to unlock your member price."
- Input + **Apply**.
  - Valid code → the band switches to an applied state: "✓ SOFT-7K2Q applied — welcome, Aziz" with the discount summary and a **remove** (✕). Prices across the grid update.
  - Invalid → "That code isn't valid." Disabled → "That code has expired." Inline, no blank failure.

### Toolbar
- Search box (name, description, tag, category — live).
- Tag chips (All + each tag).
- Sort select: featured / price low→high / price high→low / name A–Z.

### Product grid
- Cards via `auto-fill, minmax(250px, 1fr)`; 1–2 columns on mobile.
- **Card, locked (no code):** image/placeholder, tags, name, description, **regular price**, and a soft hint that a member price is available with a code. Reserve is present but disabled with a tooltip: "Enter your Softclub code to reserve."
- **Card, unlocked (valid code):** badges ("Softclub −15%"), **regular price struck**, **member price** large, **"Save $X"** pill, and an active **Reserve** button.
- **Out of stock:** "Out of stock" badge; Reserve disabled regardless of code. **Low stock:** "Only N left".

## Reserve flow

1. Student taps **Reserve** on an unlocked, in-stock card.
2. A short form appears (modal or route):
   - **Name** (pre-filled from the code's student name; editable)
   - **Contact** (phone / Telegram — required; label it with what the shop actually uses)
   - **Quantity** (default 1) and an optional **note**
   - A clear summary: product, member price, quantity, total.
3. **Confirm reservation** → creates the reservation (snapshots price + name) → **confirmation screen**:
   - "Reservation received. The shop will contact you to arrange pickup and payment."
   - Show what was reserved and the contact the shop will use. Offer "Reserve something else" (back to store).

Reserve is **never** available without a valid code — that's the verification gate.

## States

- **Loading grid:** skeleton cards.
- **No results (search/filter):** "No products match your search." + a reset.
- **Empty catalogue:** friendly message (shouldn't happen once seeded).
- **Reservation error:** "Couldn't send your reservation — please try again." with retry; never lose the form input.

## Access model recap (from Roadmap)

- Anyone can **browse** at regular price — the store is not locked.
- The **code** unlocks the **member price** and the **Reserve** button.
- The code is the key to the discount and the proof of being a Softclub student, all in one.

## QR / distribution (informational)

The shop will hang a QR code at the academy that opens this store, and hand each student their personal code. Building an in-app QR generator is Phase 2; for v1 just make sure the deployed URL is clean and shareable.

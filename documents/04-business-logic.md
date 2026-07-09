# 04 — Business Logic

The rules that must be **identical everywhere**. Put them in one shared module (e.g. `lib/pricing.ts`, `lib/codes.ts`) and reuse from both UI and API. Never re-implement the maths in a component.

## 1. Discount & price

Two prices exist for every product:

- **Regular price** = `product.price`. Shown to everyone.
- **Member price** = shown only after a valid code is applied.

The effective discount for a student on a given product:

```
effectiveDiscount(product, code):
    bonus = code.extra_discount if code and code.extra_discount is not null else 0
    return clamp(product.member_discount + bonus, 0, 90)  # code stacks on top of the product's own discount
```

Member price:

```
memberPrice(product, code):
    d = effectiveDiscount(product, code)
    raw = product.price * (1 - d / 100)
    return round(raw)                          # round to a whole unit for a clean price

saving(product, code):
    return product.price - memberPrice(product, code)
```

Rules:
- Round member prices to whole units so students never see `679.15`.
- A discount of `0` (or no code) means the member price equals the regular price — show no strike-through, no saving badge.
- Clamp discounts to 0–90. Never allow a negative or >100% price.

> **Phase 2 (campaigns):** a shared campaign code, if valid and in scope, applies **on top** of the member price: `final = applyCampaign(memberPrice, campaign)`. Percent multiplies; fixed subtracts (floored at 0). Not in v1.

## 2. Code validation (the verification step)

```
validateCode(input):
    code = trim(input).toUpperCase()
    if code is empty: return { ok: false, reason: "empty" }
    row = findCodeCaseInsensitive(code)
    if row is null:      return { ok: false, reason: "invalid" }   # "That code isn't valid."
    if not row.active:   return { ok: false, reason: "disabled" }  # "That code has expired."
    return { ok: true, code: row }
```

- Validation runs **server-side** (an endpoint or Supabase RPC). The storefront must never download the full `student_codes` table. The endpoint returns only: `ok`, `student_name`, and the effective discount info needed to price the cart — nothing more.
- On a successful unlock, increment `uses_count` and set `last_used_at`. (Debounce so re-rendering doesn't inflate the count — count an *unlock event* and each *reservation*, not every keystroke or price recompute.)
- The applied code lives in client state for the session only. There are no student logins; refreshing can reasonably require re-entering the code, or persist it in the URL/local state — keep it simple and non-sensitive.

### Abuse handling (lightweight, v1)
Codes are reusable by design. Protection is: the owner sees `uses_count` and `last_used_at` per code and can toggle a code **off** in one click. That's enough for v1. (Hard usage caps are Phase 2.)

## 3. Reservation lifecycle

States: `new → contacted → completed`, with `cancelled` available from any non-completed state.

```
createReservation(code, product, form):
    # code is optional — reserving works without one, at the regular price
    if code: require validateCode(code).ok
    reservation = {
        code_id: code.id if code else null,
        student_name: form.name,
        student_contact: form.contact,
        product_id: product.id,
        product_name: product.name,          # snapshot
        unit_price: memberPrice(product, code) if code else product.price,  # snapshot
        quantity: form.quantity or 1,
        status: "new",
        note: form.note,
    }
    insert(reservation)
    if code: increment code.uses_count; set code.last_used_at
    return confirmation
```

Transitions (admin):
- `new → contacted` — owner has reached out.
- `contacted → completed` — sale done in the shop. **On this transition, decrement `product.stock` by `quantity`** (floor at 0). This is the only place stock moves in v1.
- `* → cancelled` — student didn't proceed. No stock change.

Rules:
- Reservations do **not** reserve/hold stock. Stock is physical and only changes on `completed`.
- Never mutate a reservation's snapshot fields after creation.
- Guard the completed→stock step so it can't run twice for the same reservation (idempotent by status).

## 4. Stock display

```
stockLabel(product):
    if product.stock <= 0: return "Out of stock"     # disable Reserve
    if product.stock <= 3: return "Only N left"
    return null                                       # no badge
```

Out-of-stock items stay visible (so students can ask / see the range) but can't be reserved.

## 5. Validation & edge cases to handle

- Empty search / no results → friendly empty state, not a blank grid.
- Product edited or deleted after a reservation → reservation still shows its snapshot; link gracefully handles a missing product.
- Duplicate code generation → enforce uniqueness at the DB level and retry generation on collision.
- Currency: store a single currency symbol in config (default `$`; the shop may set Somoni). Format consistently via one helper.

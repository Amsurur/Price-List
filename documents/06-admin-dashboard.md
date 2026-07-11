# 06 — Admin Dashboard

Private, behind login, under `/admin`. Built for one non-technical owner: clarity over density. Three working areas plus a light stats strip: **Products**, **Student codes**, **Reservations**.

## Login (`/admin/login`)
- Email + password via Supabase Auth. One owner account for v1.
- On success → dashboard. On failure → "Email or password is incorrect." Any `/admin/*` route while logged out → redirect here.

## Shell
- Sticky top bar: brand/seal, a link back to the storefront ("View store"), and sign-out.
- Tabs: **Products · Student codes · Reservations**.
- Stats strip (F9): total products · items in stock · active codes · open reservations (new + contacted).

## Products tab

### List
- Rows: thumbnail, name, category, tags, stock ("N in stock" / red "out of stock"), price (regular struck if a member discount exists, member price shown), Edit / Delete.
- Tools: search box, tag filter, "Add product" (primary button).

### Add / edit product (panel or route)
Fields:
- **Name** (required)
- **Category** (free text, suggests existing categories)
- **Tags** (comma separated → lowercased array)
- **Regular price** (integer)
- **Softclub member discount %** (0–90, default 15)
- **Stock quantity** (integer)
- **Image** (upload to Supabase Storage; live preview; optional → placeholder)
- **Description** (textarea)
- **Active** (toggle; inactive hides it from the store without deleting)

Actions: **Save product** (create or update) · **Delete** (confirm). Deleting must not corrupt past reservations (they hold snapshots).

## Student codes tab

The verification + discount engine. Make generating and handing out codes effortless.

### List
- Rows: the code (as a copyable pill), student name, extra discount (bonus % on top of each product's own, or "none"), **active toggle**, use count + last used, Edit / Delete.
- Tools: search, "Generate code", "Generate batch", **Export CSV**.

### Generate
- **Single:** optional student name, optional extra discount %, note → creates one unique, readable code (e.g. `SOFT-7K2Q`). Show it prominently with a copy button.
- **Batch:** "How many?" → generates N unique codes at once (optionally a shared extra discount). List them; **Export CSV** to print/hand out.
- Codes are unique (DB-enforced); regenerate on any collision.

### Manage
- **Toggle active** disables/enables a code instantly in the store.
- **Extra discount**: set → that student gets this % on top of each product's own member discount (clamped at 90); clear → they just get each product's standard member discount.
- Owner watches `use count` / `last used`; if a code looks shared/abused, toggle it off. (Hard caps are Phase 2.)

## Reservations tab

The queue that turns interest into sales.

### List
- Newest first. Each row: student name + contact, product (snapshot name), member price × quantity, the code used, time, and a **status** control.
- Filter by status. Optional search by name/contact.

### Status pipeline
- `new` → **Mark contacted** → `contacted` → **Mark completed** → `completed`.
- **Cancel** available on non-completed reservations → `cancelled`.
- On **completed**, decrement the product's stock by the reserved quantity (once, idempotent).
- Make it obvious what to do next on a `new` reservation (contact the student).

## States (all lists/forms)
- **Loading:** skeleton rows / spinner, not a blank screen.
- **Empty:** e.g. "No products yet — add your first one." / "No reservations yet — they'll appear here when a student reserves."
- **Error:** plain message + retry. Never a raw stack trace.

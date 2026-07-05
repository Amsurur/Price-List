# 09 — Owner guide

A short, practical guide for running the shop day to day. No developer knowledge needed.

## Log in

Go to `/admin` and sign in with your owner email and password. You'll land on the **Dashboard** — a quick count of products, in-stock items, active codes, and open reservations.

## Add a product

1. Go to the **Products** tab and click **Add product**.
2. Fill in name, category, tags (comma separated — e.g. `laptop, design`), regular price, member discount %, and stock.
3. Upload a photo. Square-ish images look best on the card.
4. Leave **Active** checked so it shows in the store, or uncheck it to hide a product while you're still setting it up.
5. Click **Save product**.

To change a product later (price, stock, photo, anything), find it in the **Products** list and click **Edit**. Editing never changes past reservations — they keep the price and name from when the student reserved.

Stock only goes down automatically when you mark a reservation **completed** (see below) — editing the stock number by hand is for correcting counts, restocking, or taking something off the floor.

## Generate and hand out a student code

1. Go to the **Student codes** tab.
2. Click **Generate code** for one student (optionally add their name and a note), or **Generate batch** to make several at once for a class.
3. Copy the code (click it to copy) and give it to the student — in person, by message, however's easiest.
4. The student enters that code on the store's home page to unlock their member price and the **Reserve** button.

**Discount override:** every code uses the standard member discount unless you set an override % when generating or editing it (0–90). Use this for a student with a special deal.

**Turning a code off:** if a code is being misused or a student leaves, click its status pill (**Active** / **Disabled**) to toggle it — no need to delete it, and you keep its history.

**Export:** click **Export CSV** on the Student codes page for a spreadsheet of every code, its student, use count, and last-used date.

## Work a reservation to a sale

When a student reserves an item, it lands in **Reservations** with status **New**.

1. Contact the student (their phone/Telegram is on the row) to arrange pickup and payment, then click **Mark contacted**.
2. When they've paid and picked up in the shop, click **Mark completed**. This is the only moment stock decreases — do it exactly once per reservation.
3. If a student cancels or never follows through, click **Cancel** instead. Cancelled reservations don't touch stock.

Filter the list by status, or search by student name/contact, to find what needs attention.

## Put a code in front of students (for now)

There's no in-app QR generator yet (that's a later phase). Until then:

1. Open the store's home page (`/`) on a phone or in a QR generator of your choice (many free web tools make a QR from any URL — paste the store's web address in).
2. Print the QR and put it up at the shop or share it with the academy. Anyone can browse without a code; entering their code is what unlocks their price and lets them reserve.

## If something looks wrong

- **A price looks off:** check the product's regular price and member discount % on the Products tab — the member price and savings are calculated automatically, never entered by hand.
- **A code won't apply:** check it's spelled right (codes look like `SOFT-XXXX`) and that it's still **Active** on the Student codes tab.
- **A reservation is stuck:** it just needs you to move it forward — **New → Contacted → Completed** (or **Cancelled**). Nothing happens automatically except the stock decrease on Completed.

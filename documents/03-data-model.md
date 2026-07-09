# 03 — Data Model

Postgres (via Supabase). Three tables for v1: `products`, `student_codes`, `reservations`. A fourth, `promo_campaigns`, is **Phase 2** — the shape is included so the schema can grow cleanly, but do not build features on it yet.

Conventions: `id` is a UUID primary key (`gen_random_uuid()`); every table has `created_at timestamptz default now()`; money is stored as an integer in the **smallest sensible unit or whole currency units** — pick one and be consistent (whole units is fine for this shop). Percentages are integers 0–90.

## products

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text, not null | e.g. "Design Laptop — Core i7" |
| description | text | short, shown on the card |
| category | text | e.g. "Laptops" (free text, suggested via existing values) |
| tags | text[] | lowercased, e.g. `{laptop, design, i7}` — used by filters and campaign scope |
| price | integer, not null | **regular** price (before any discount) |
| member_discount | integer, default 15 | standard Softclub discount % for this item |
| stock | integer, default 0 | physical stock on hand |
| image_url | text | Supabase Storage URL; nullable → placeholder |
| active | boolean, default true | hide without deleting |
| created_at / updated_at | timestamptz | |

## student_codes

The heart of v1. One row per student. The code does three jobs: **verify** the student is from Softclub, **apply** their discount, and **track** their activity.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| code | text, unique, not null | readable, e.g. `SOFT-7K2Q`; compared case-insensitively |
| student_name | text | optional label for the owner |
| extra_discount | integer, nullable | if set, this % stacks **on top of** each product's own `member_discount` (e.g. product 10% + code 5% = 15%, clamped at 90); if null, only the product's own discount applies |
| active | boolean, default true | toggle off to disable instantly |
| note | text | admin-only note |
| uses_count | integer, default 0 | incremented each time the code successfully unlocks pricing or makes a reservation (see logic doc) |
| last_used_at | timestamptz, nullable | for spotting sharing/abuse |
| created_at | timestamptz | |

## reservations

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| code_id | uuid FK → student_codes.id, nullable | which student reserved — null when reserved without a code, at regular price |
| student_name | text | captured on the form |
| student_contact | text, not null | phone / Telegram / whatever the shop uses |
| product_id | uuid FK → products.id | reference (may later change or be deleted) |
| product_name | text, not null | **snapshot** of the name at reservation time |
| unit_price | integer, not null | **snapshot** of the price paid — member price if a code was used, regular price otherwise |
| quantity | integer, default 1 | |
| status | text, default 'new' | one of: `new`, `contacted`, `completed`, `cancelled` |
| note | text | optional student note |
| created_at / updated_at | timestamptz | |

**Why snapshots:** once a reservation exists, editing or deleting a product must not rewrite history. The card links back via `product_id` when it still exists, but always displays `product_name` / `unit_price`.

## promo_campaigns — Phase 2 only (shape reference)

Shared codes (not per-student) that stack an *extra* discount on top of the member price, with limits.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| code | text, unique | shared, e.g. `BACK2SCHOOL` |
| type | text | `percent` or `fixed` |
| value | integer | percent (0–90) or a fixed amount off |
| scope | text | `all` or `tags` |
| tags | text[] | when scope = `tags` |
| active | boolean | |
| expires_at | timestamptz, nullable | |
| max_uses / uses_count | integer | usage cap |

## Relationships

```
student_codes 1 ──< reservations >── 1 products
```
A student code has many reservations. A product has many reservations. Reservations keep snapshots so they survive product/price changes.

## Row Level Security (Supabase)

- `products`: **public read** where `active = true`; **write** only for the authenticated admin.
- `student_codes`: **no public read** of the table. Validation happens through a controlled server function/endpoint that returns only what the storefront needs (valid? name? effective discount?) — never the whole list. Full read/write for admin only.
- `reservations`: **insert** allowed from the storefront (through the reservation endpoint); **read/update** for admin only.

## Seed data

Reuse the sample catalogue from the prototype (laptops, desktops, a monitor, printers, accessories) and a few example codes (one standard, one with an extra discount, one disabled) so screens aren't empty during development. Keep seeds in a script, not in app code.

# 01 — Product Spec

## Problem

The shop sells computer hardware (laptops, PCs, printers, keyboards, accessories). It is next to / partnered with **Softclub**, an IT & design academy. New students frequently need equipment, but there's no easy way to show them what's available at a member price, so most of them buy elsewhere. **The shop loses customers it should have won.**

## Goal

Give Softclub students a simple online store with a member price, and give the shop a simple way to capture and close those sales. Success is measured in one number: **reservations that turn into sales.**

## Users & roles

- **Shop owner / staff (admin).** Logs in. Manages products, generates and tracks student codes, works reservations. There is effectively one operator; keep roles simple (a single authenticated admin is fine for v1).
- **Softclub student (customer).** Not logged in. Browses the store, enters a personal code to unlock the member price, and reserves items. Identified only by the code they were given.

There is intentionally **no Softclub-staff role** — the academy is not part of the app.

## Core user journey (the path we optimise)

1. Student enrols at Softclub and is handed a **unique code** (given out by the shop; see how codes are created in `06-admin-dashboard.md`).
2. Student opens the store (link or a QR code hung at the academy).
3. Student browses — sees products at **regular price**.
4. Student enters their code → verified as a Softclub member → **member price** now shows on every item, with the regular price struck out and the saving displayed.
5. Student taps **Reserve** on an item → confirms name + contact (pre-filled from the code) → sees a "reservation received" confirmation.
6. The reservation lands in the **admin dashboard** with the student's name, item, member price, and contact.
7. Owner contacts the student / the student comes to the shop → **pays and picks up** → owner marks it **completed**.
8. Later the student returns for accessories with the same code, and tells friends.

The app's job is to make every step frictionless and to lose no one in the middle.

## Scope — v1 (build this)

**In:**
- Product catalogue with categories, tags, search, filter, sort, stock display.
- Regular price for everyone; member price unlocked by a valid personal code.
- Unique student codes: generate (single + batch), per-student extra discount (stacks on top of each product's own), activate/deactivate, usage tracking, CSV export.
- Reserve flow (no payment) + a reservations queue in admin with statuses.
- Admin login; product management with image upload.
- Responsive, accessible, deployed.

**Out (deferred — see Roadmap §6):**
- Online payment, deposits, installments.
- Shared promo *campaign* codes, expiry, usage caps.
- Product detail pages, compare tool, wishlists, "notify when back".
- Analytics dashboards, notifications, referrals, reviews, repairs/trade-in.
- Any Softclub-side accounts or integration.

## Non-goals / principles

- Don't build a general e-commerce platform. Build *this shop's* tool for *these* students.
- Don't add online payments "just in case." The pickup model is a deliberate choice.
- Keep the admin usable by one non-technical person. Clarity over features.

# Softclub Store — Build Package (TZ)

This folder is a complete specification ("техническое задание") for building the Softclub Store app with **Claude Code**.

## How to use it

1. Create an empty folder for the project and drop these files inside (keep the structure — `Roadmap.md` and `CLAUDE.md` at the root, the rest in `docs/`).
2. Open the folder in **Claude Code**.
3. Tell Claude Code:
   > Read `CLAUDE.md` and `Roadmap.md`, then start on milestone **M0**. Follow the docs in `/docs`. Stop after M0 so I can check it before you continue.
4. Work milestone by milestone (M0 → M5). After each one, review the live result before moving on.

## What's inside

- **`Roadmap.md`** — the plan: the one goal, locked decisions, milestones, and the definition of done. *The file to keep open.*
- **`CLAUDE.md`** — project instructions Claude Code reads automatically (summary, rules, conventions, commands).
- **`docs/01-product-spec.md`** — vision, users, journeys, scope.
- **`docs/02-features.md`** — every feature with acceptance checklists.
- **`docs/03-data-model.md`** — database tables, fields, relationships.
- **`docs/04-business-logic.md`** — discount maths, code validation, reservation lifecycle, stock.
- **`docs/05-design-system.md`** — colours, type, components, the look to match.
- **`docs/06-admin-dashboard.md`** — admin screens, field by field.
- **`docs/07-storefront.md`** — the student storefront and its states.
- **`docs/08-tech-stack.md`** — stack, project structure, setup, deploy.

## The short version

A two-sided app: a **storefront** where Softclub students unlock a **member price** with a **unique personal code** and **reserve** items, and an **admin dashboard** to manage products, codes, and reservations. No online payment — sales finish in the shop. Build it small, one milestone at a time.

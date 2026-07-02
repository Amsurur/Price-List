# 05 — Design System

Match the look already approved in the prototype. It is deliberately **not** a generic template: an electric indigo-violet brand, a geometric display face, tabular price typography, and a circular "member" seal as the signature. Keep everything else quiet so the brand and the prices carry the page.

## Direction in one line

A modern, trustworthy tech-retail feel for a design-school audience — clean light surfaces, confident violet brand, prices treated like the hero of every card.

## Colour tokens

Light-first, but design so a near-black background would still be readable (support dark mode later; don't hardcode `#333` text).

| Token | Hex | Use |
|---|---|---|
| `bg` | `#F5F6FB` | page background (cool off-white) |
| `surface` | `#FFFFFF` | cards, bars |
| `ink` | `#14161D` | primary text, big prices |
| `muted` | `#6B7280` | secondary text |
| `line` | `#E7E9F2` | hairline borders |
| `brand` | `#5A4BFF` | primary actions, seal, active states |
| `brand-strong` | `#3F32C7` | brand text on light, hovers |
| `brand-tint` | `#EEEDFF` | brand pills, badges, placeholders |
| `save` | `#0FA37F` | savings, member price, positive |
| `save-tint` | `#E4F6EF` | savings pill background |
| `warn` | `#B7791F` / tint `#FBF3E4` | campaign badges (Phase 2) |
| `danger` | `#D04A3B` | destructive actions, out-of-stock |

Text on a coloured fill uses a dark shade of that same family — never plain black or grey on a tint.

### Tailwind config (extend)

```js
theme: { extend: {
  colors: {
    bg:'#F5F6FB', surface:'#FFFFFF', ink:'#14161D', muted:'#6B7280', line:'#E7E9F2',
    brand:{ DEFAULT:'#5A4BFF', strong:'#3F32C7', tint:'#EEEDFF' },
    save:{ DEFAULT:'#0FA37F', tint:'#E4F6EF' },
    warn:{ DEFAULT:'#B7791F', tint:'#FBF3E4' },
    danger:'#D04A3B',
  },
  fontFamily: { display:['"Space Grotesk"','sans-serif'], sans:['Inter','system-ui','sans-serif'] },
  borderRadius: { xl:'15px' },
}}
```

## Typography

- **Display** (headings, buttons, prices): **Space Grotesk** — geometric, techy, at home in a design school. Weights 500–700.
- **Body / UI**: **Inter** — neutral and legible. Weights 400–600.
- **Prices** use Space Grotesk with **tabular figures** (`font-variant-numeric: tabular-nums`) so numbers align.
- Sentence case everywhere. No ALL-CAPS words except tiny eyebrow labels with wide letter-spacing.

Scale (rough): page title 28–34px / section 16–18px / body 14–15px / small 12–13px / eyebrow 11–12px uppercase tracked.

## Signature element

A **circular member seal** — a ring with the shop initial and a subtle "member price" motif in brand violet. It appears in the top bar and on the code-unlock moment. This is the one bold thing; don't add competing decoration.

## Components

- **Cards** (`radius 14px`, `1px solid line`, soft shadow, white). Hover lifts 2px. This is the base for products.
- **Product price block:** regular price small + struck (muted) when discounted; member price large in `ink` (Space Grotesk); a `save` pill "Save $X". Small badges above: "Softclub −15%" (brand tint), and later a campaign badge (warn tint).
- **Buttons:** solid brand for primary ("Reserve", "Apply", "Save product"); outline/ghost for secondary; danger styling for delete. Space Grotesk 600. The label says exactly what happens ("Reserve", "Mark completed" — not "Submit").
- **Chips / tags:** pill, `line` border, brand fill when active (filters); tiny brand-tint tags on cards.
- **Inputs:** `line` border, `radius 10px`, clear `brand` focus ring. Labels are plain and above the field.
- **Segmented toggles / status pills:** used for the shop/admin switch, sort, and reservation status.
- **Seal + promo bar:** the unlock area uses the brand as a filled band; keep it to one.

## Layout

- Sticky top bar with brand + (admin) view/tab controls.
- Content max-width ~1100–1160px, centered, generous whitespace.
- Product grid: `auto-fill, minmax(250px, 1fr)`. Mobile → 1–2 columns.
- Admin lists: row layout with thumbnail, main info, price, and actions.

## Motion & quality floor

- Subtle only: card hover lift, price/badge updates, a gentle seal accent. Respect `prefers-reduced-motion`.
- Responsive to mobile; visible keyboard focus; adequate contrast; no motion required to understand anything.
- Flat surfaces — avoid heavy gradients, glows, or noise. Spend detail on spacing and type, not effects.

## Writing rules (copy is design material)

- Plain, active voice, sentence case. Name things by what the user does.
- A control keeps its name through the flow: the button "Reserve" leads to a toast "Reserved" / "Reservation received".
- Errors state what happened and how to fix it, in the interface's voice — no apologies, never vague. "That code isn't valid." not "Oops, something went wrong."
- Empty states invite action: "No reservations yet — they'll appear here when a student reserves an item."

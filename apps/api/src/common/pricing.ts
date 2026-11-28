// The pricing + stock rules that must be IDENTICAL everywhere.
// Single source of truth — see documents/04-business-logic.md.
// Keep this dependency-free (plain numbers in, plain numbers out) so it is
// trivial to unit-test and reuse.

// A product's discount inputs, and a student code's optional bonus.
export interface PricingProduct {
  price: number;
  memberDiscount: number;
  // A sale for everyone; stacks with the member discount. Optional so older
  // callers (and tests) that predate sales still type-check.
  salePercent?: number;
}

export interface PricingCode {
  extraDiscount: number | null;
}

// Keep every discount within 0–90 so a price can never go negative or free.
export function clampDiscount(percent: number): number {
  if (Number.isNaN(percent)) return 0;
  return Math.min(90, Math.max(0, Math.round(percent)));
}

// The product's own member discount, plus its sale (if any), plus a code's
// extraDiscount on top
// (e.g. product 10% + code 5% = 15%), clamped so the sum can never exceed 90.
// No code, or a code with no bonus → just the product's own discount.
export function effectiveDiscount(
  product: PricingProduct,
  code: PricingCode | null,
): number {
  const bonus = code?.extraDiscount ?? 0;
  return clampDiscount(
    product.memberDiscount + (product.salePercent ?? 0) + bonus,
  );
}

// Member price, rounded to a whole unit so students never see 679.15.
export function memberPrice(
  product: PricingProduct,
  code: PricingCode | null,
): number {
  const d = effectiveDiscount(product, code);
  return Math.round(product.price * (1 - d / 100));
}

// What the student saves versus the regular price (0 when there's no discount).
export function saving(
  product: PricingProduct,
  code: PricingCode | null,
): number {
  return product.price - memberPrice(product, code);
}

// A product with options: the chosen colour and configuration each add their
// extraPrice to the base price; the discount then applies to the total.
export interface PricingOptions {
  colors: { name: string; extraPrice: number }[];
  configs: { label: string; extraPrice: number }[];
}

export interface VariantPrice {
  color: string | null;
  config: string | null;
  price: number;
  memberPrice: number;
  saving: number;
}

// Base price plus the chosen options' extras. Unknown names add nothing —
// callers that must reject unknown options check that themselves.
export function optionsPrice(
  product: PricingProduct & PricingOptions,
  color: string | null,
  config: string | null,
): number {
  const c = product.colors.find((x) => x.name === color);
  const k = product.configs.find((x) => x.label === config);
  return product.price + (c?.extraPrice ?? 0) + (k?.extraPrice ?? 0);
}

// Every colour × configuration combination, priced. Products have a handful
// of options at most, so the full table is small and lets the storefront show
// the right price for any pick without redoing the discount maths.
export function variantPrices(
  product: PricingProduct & PricingOptions,
  code: PricingCode | null,
): VariantPrice[] {
  const colors = product.colors.length
    ? product.colors.map((c) => c.name)
    : [null];
  const configs = product.configs.length
    ? product.configs.map((c) => c.label)
    : [null];
  const rows: VariantPrice[] = [];
  for (const color of colors) {
    for (const config of configs) {
      const priced = {
        price: optionsPrice(product, color, config),
        memberDiscount: product.memberDiscount,
        salePercent: product.salePercent,
      };
      rows.push({
        color,
        config,
        price: priced.price,
        memberPrice: memberPrice(priced, code),
        saving: saving(priced, code),
      });
    }
  }
  return rows;
}

// Badge text for stock, or null for no badge. Out-of-stock items stay visible
// but can't be reserved (enforced elsewhere).
export function stockLabel(stock: number): string | null {
  if (stock <= 0) return 'Нет в наличии';
  if (stock <= 3) return `Осталось ${stock}`;
  return null;
}

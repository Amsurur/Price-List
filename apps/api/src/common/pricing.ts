// The pricing + stock rules that must be IDENTICAL everywhere.
// Single source of truth — see documents/04-business-logic.md.
// Keep this dependency-free (plain numbers in, plain numbers out) so it is
// trivial to unit-test and reuse.

// A product's discount inputs, and a student code's optional override.
export interface PricingProduct {
  price: number;
  memberDiscount: number;
}

export interface PricingCode {
  discountOverride: number | null;
}

// Keep every discount within 0–90 so a price can never go negative or free.
export function clampDiscount(percent: number): number {
  if (Number.isNaN(percent)) return 0;
  return Math.min(90, Math.max(0, Math.round(percent)));
}

// A student with an override gets that % on everything; otherwise each product's
// standard member discount applies. No code → pass code = null → the product's own.
export function effectiveDiscount(
  product: PricingProduct,
  code: PricingCode | null,
): number {
  const raw =
    code && code.discountOverride != null
      ? code.discountOverride
      : product.memberDiscount;
  return clampDiscount(raw);
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

// Badge text for stock, or null for no badge. Out-of-stock items stay visible
// but can't be reserved (enforced elsewhere).
export function stockLabel(stock: number): string | null {
  if (stock <= 0) return 'Out of stock';
  if (stock <= 3) return `Only ${stock} left`;
  return null;
}

// The pricing + stock rules that must be IDENTICAL everywhere.
// Single source of truth — see documents/04-business-logic.md.
// Keep this dependency-free (plain numbers in, plain numbers out) so it is
// trivial to unit-test and reuse.

// A product's discount inputs, and a student code's optional bonus.
export interface PricingProduct {
  price: number;
  memberDiscount: number;
}

export interface PricingCode {
  extraDiscount: number | null;
}

// Keep every discount within 0–90 so a price can never go negative or free.
export function clampDiscount(percent: number): number {
  if (Number.isNaN(percent)) return 0;
  return Math.min(90, Math.max(0, Math.round(percent)));
}

// A code's extraDiscount stacks on top of the product's own member discount
// (e.g. product 10% + code 5% = 15%), clamped so the sum can never exceed 90.
// No code, or a code with no bonus → just the product's own discount.
export function effectiveDiscount(
  product: PricingProduct,
  code: PricingCode | null,
): number {
  const bonus = code?.extraDiscount ?? 0;
  return clampDiscount(product.memberDiscount + bonus);
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
  if (stock <= 0) return 'Нет в наличии';
  if (stock <= 3) return `Осталось ${stock}`;
  return null;
}

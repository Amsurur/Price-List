import { formatMoney } from "@/lib/format";
import type { AppliedCode } from "@/lib/use-applied-code";
import type { Product } from "@/lib/types";

// A product's discount is always priced by the API (falls back to the
// product's own memberDiscount even with no code applied), so it's always
// shown here — a code just adds its own extraDiscount on top.
export function hasDiscount(product: Product): boolean {
  return product.saving > 0;
}

export function discountPercent(product: Pick<Product, "listPrice" | "saving">): number {
  return product.listPrice > 0 ? Math.round((product.saving / product.listPrice) * 100) : 0;
}

export function DiscountBadge({ product }: { product: Product }) {
  if (!hasDiscount(product)) return null;
  return (
    <span className="tabular rounded-full bg-save px-2.5 py-1 text-xs font-bold text-white">
      −{discountPercent(product)}%
    </span>
  );
}

// Compact price for cards: old price struck through, member price in green.
export function ProductPrice({
  product,
  size = "md",
}: {
  product: Product;
  size?: "md" | "lg";
}) {
  const discounted = hasDiscount(product);
  const big = size === "lg" ? "text-4xl" : "text-xl";
  return (
    <div className="flex flex-col">
      {discounted && (
        <span className="tabular text-sm text-muted line-through">
          {formatMoney(product.listPrice)}
        </span>
      )}
      <span
        className={`tabular font-display font-bold tracking-tight ${big} ${
          discounted ? "text-save" : "text-ink"
        }`}
      >
        {formatMoney(discounted ? product.memberPrice : product.listPrice)}
      </span>
    </div>
  );
}

export function StockLabel({ product }: { product: Product }) {
  if (!product.stockLabel) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        product.stock <= 0 ? "bg-danger/10 text-danger" : "bg-warn-tint text-warn"
      }`}
    >
      {product.stockLabel}
    </span>
  );
}

// Shows how the total discount is made up, when a code with its own bonus is
// applied — e.g. "10% товара + 5% по коду = 15%". Own/code % are shown as
// entered; the total is clamped the same way the API clamps pricing (0–90),
// so the label never claims more than the price actually reflects.
export function DiscountBreakdown({
  product,
  appliedCode,
}: {
  product: Product;
  appliedCode: AppliedCode | null;
}) {
  if (!appliedCode?.extraDiscount) return null;
  const total = Math.min(90, product.memberDiscount + appliedCode.extraDiscount);
  return (
    <p className="text-xs text-muted">
      {product.memberDiscount}% товара + {appliedCode.extraDiscount}% по коду
      {" = "}
      <span className="font-medium text-ink">{total}%</span>
    </p>
  );
}

export function SavingsPill({ product }: { product: Product }) {
  if (!hasDiscount(product)) return null;
  return (
    <span className="tabular inline-block w-fit rounded-full bg-save-tint px-2.5 py-1 text-xs font-semibold text-save-strong">
      Экономия {formatMoney(product.saving)}
    </span>
  );
}

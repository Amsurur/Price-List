import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

// A product's discount is always priced by the API (falls back to the
// product's own memberDiscount even with no code applied), so it's always
// shown here — a code only matters when it unlocks a bigger personal
// discountOverride.
export function hasDiscount(product: Product): boolean {
  return product.saving > 0;
}

export function DiscountBadge({ product }: { product: Product }) {
  if (!hasDiscount(product)) return null;
  const discountPercent =
    product.price > 0 ? Math.round((product.saving / product.price) * 100) : 0;
  return (
    <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand-strong">
      Computerra −{discountPercent}%
    </span>
  );
}

export function ProductPrice({
  product,
  showStock = true,
}: {
  product: Product;
  showStock?: boolean;
}) {
  const discounted = hasDiscount(product);
  return (
    <div className="flex items-center justify-between gap-2">
      {discounted ? (
        <div className="flex flex-col">
          <span className="text-xs text-muted line-through">
            {formatMoney(product.price)}
          </span>
          <span className="tabular font-display text-lg font-semibold text-ink">
            {formatMoney(product.memberPrice)}
          </span>
        </div>
      ) : (
        <span className="tabular font-display text-lg font-semibold text-ink">
          {formatMoney(product.price)}
        </span>
      )}
      {showStock && product.stockLabel && (
        <span
          className={`text-xs font-medium ${
            product.stock <= 0 ? "text-danger" : "text-warn"
          }`}
        >
          {product.stockLabel}
        </span>
      )}
    </div>
  );
}

export function SavingsPill({ product }: { product: Product }) {
  if (!hasDiscount(product)) return null;
  return (
    <span className="inline-block w-fit rounded-full bg-save-tint px-2 py-0.5 text-xs font-medium text-save">
      Экономия {formatMoney(product.saving)}
    </span>
  );
}

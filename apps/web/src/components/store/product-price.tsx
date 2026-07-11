import { formatMoney } from "@/lib/format";
import type { AppliedCode } from "./code-unlock-strip";
import type { Product } from "@/lib/types";

// A product's discount is always priced by the API (falls back to the
// product's own memberDiscount even with no code applied), so it's always
// shown here — a code just adds its own extraDiscount on top.
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
    <span className="inline-block w-fit rounded-full bg-save-tint px-2 py-0.5 text-xs font-medium text-save">
      Экономия {formatMoney(product.saving)}
    </span>
  );
}

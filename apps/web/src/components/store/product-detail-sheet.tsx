"use client";

import { useState } from "react";
import { useIsMobile } from "@/lib/use-is-mobile";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SideDrawer } from "@/components/ui/side-drawer";
import type { AppliedCode } from "./code-unlock-strip";
import { DiscountBadge, ProductPrice, SavingsPill } from "./product-price";
import { ImageLightbox } from "./image-lightbox";
import { ProductImageCarousel } from "./product-image-carousel";
import { ReserveForm } from "./reserve-form";
import type { Product } from "@/lib/types";

// Full product detail + Reserve, opened from the card's "Забронировать"
// button. Slides up from the bottom on phone, in from the right on laptop —
// picked at render time from the same breakpoint the rest of the storefront
// uses (useIsMobile).
export function ProductDetailSheet({
  product,
  appliedCode,
  onClose,
}: {
  product: Product;
  appliedCode: AppliedCode | null;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const titleId = `product-detail-${product.id}`;
  const unlocked = Boolean(appliedCode);
  const outOfStock = product.stock <= 0;

  const content = (
    <div className="flex flex-col gap-4">
      <ProductImageCarousel
        images={product.images}
        onImageClick={(index) => setLightboxIndex(index)}
      />

      {(product.tags.length > 0 || product.category) && (
        <div className="flex flex-wrap gap-1.5">
          <DiscountBadge product={product} />
          {product.category && (
            <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-muted">
              {product.category}
            </span>
          )}
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-tint px-2 py-0.5 text-xs text-brand-strong"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div>
        <h2
          id={titleId}
          className="font-display text-lg font-semibold text-ink"
        >
          {product.name}
        </h2>
        {product.description && (
          <p className="mt-1 text-sm text-muted">{product.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <ProductPrice product={product} />
        <SavingsPill product={product} />
        {!unlocked && (
          <p className="text-xs text-muted">
            Есть личный код Computerra? Он может дать скидку больше.
          </p>
        )}
      </div>

      {outOfStock ? (
        <p className="rounded-xl bg-bg px-3 py-2 text-sm text-muted">
          Этого товара нет в наличии.
        </p>
      ) : (
        <ReserveForm
          product={product}
          appliedCode={appliedCode}
          onClose={onClose}
          embedded
        />
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <BottomSheet onClose={onClose} labelledBy={titleId}>
          {content}
        </BottomSheet>
      ) : (
        <SideDrawer onClose={onClose} labelledBy={titleId}>
          {content}
        </SideDrawer>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={product.images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

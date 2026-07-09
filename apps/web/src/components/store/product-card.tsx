"use client";

import { useState } from "react";
import type { AppliedCode } from "./code-unlock-strip";
import { ImageLightbox } from "./image-lightbox";
import { ProductDetailSheet } from "./product-detail-sheet";
import { ProductImageCarousel } from "./product-image-carousel";
import {
  DiscountBadge,
  DiscountBreakdown,
  ProductPrice,
  SavingsPill,
  hasDiscount,
} from "./product-price";
import type { Product } from "@/lib/types";

// A product's discount always shows, whether or not a Computerra code is
// applied — a code adds its own extraDiscount on top. `unlocked` here only
// affects the code-hint copy.
export function ProductCard({
  product,
  appliedCode,
}: {
  product: Product;
  appliedCode: AppliedCode | null;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const unlocked = Boolean(appliedCode);
  const outOfStock = product.stock <= 0;
  const showBadge = hasDiscount(product);

  return (
    <li className="flex flex-col rounded-xl border border-line bg-surface p-4 transition-transform hover:-translate-y-0.5">
      <ProductImageCarousel
        images={product.images}
        onImageClick={(index) => setLightboxIndex(index)}
      />

      {(product.tags.length > 0 || showBadge) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {showBadge && <DiscountBadge product={product} />}
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-tint px-2 py-0.5 text-xs text-brand-strong"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h3 className="mt-2 font-display font-semibold text-ink">
        {product.name}
      </h3>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {product.description}
        </p>
      )}

      <div className="mt-3">
        <ProductPrice product={product} />
      </div>

      {showBadge && (
        <div className="mt-2 flex flex-col gap-1">
          <SavingsPill product={product} />
          <DiscountBreakdown product={product} appliedCode={appliedCode} />
        </div>
      )}

      {!unlocked && (
        <p className="mt-1 text-xs text-muted">
          Есть личный код Computerra? Он может дать скидку больше.
        </p>
      )}

      {!outOfStock ? (
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mt-3 w-full rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Забронировать
        </button>
      ) : (
        <button
          type="button"
          disabled
          title="Нет в наличии."
          className="mt-3 w-full cursor-not-allowed rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white opacity-50"
        >
          Забронировать
        </button>
      )}

      {detailOpen && (
        <ProductDetailSheet
          product={product}
          appliedCode={appliedCode}
          onClose={() => setDetailOpen(false)}
        />
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={product.images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </li>
  );
}

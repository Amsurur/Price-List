"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { useIsMobile } from "@/lib/use-is-mobile";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { AppliedCode } from "./code-unlock-strip";
import { ImageLightbox } from "./image-lightbox";
import { ProductImageCarousel } from "./product-image-carousel";
import { ReserveForm } from "./reserve-form";
import type { Product } from "@/lib/types";

// `unlocked` reflects whether a valid Computerra code is currently applied in
// this session — never inferred from product.saving, since the API returns
// a non-zero saving for admin/reference purposes even with no code applied.
export function ProductCard({
  product,
  appliedCode,
}: {
  product: Product;
  appliedCode: AppliedCode | null;
}) {
  const [reserving, setReserving] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const reserveSheetTitleId = `reserve-sheet-${product.id}`;
  const unlocked = Boolean(appliedCode);
  const outOfStock = product.stock <= 0;
  const hasSaving = unlocked && product.saving > 0;
  const discountPercent =
    hasSaving && product.price > 0
      ? Math.round((product.saving / product.price) * 100)
      : 0;

  return (
    <li className="flex flex-col rounded-xl border border-line bg-surface p-4 transition-transform hover:-translate-y-0.5">
      <ProductImageCarousel
        images={product.images}
        onImageClick={(index) => setLightboxIndex(index)}
      />

      {(product.tags.length > 0 || hasSaving) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hasSaving && (
            <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand-strong">
              Computerra −{discountPercent}%
            </span>
          )}
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

      <div className="mt-3 flex items-center justify-between gap-2">
        {hasSaving ? (
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
        {product.stockLabel && (
          <span
            className={`text-xs font-medium ${
              outOfStock ? "text-danger" : "text-warn"
            }`}
          >
            {product.stockLabel}
          </span>
        )}
      </div>

      {hasSaving && (
        <span className="mt-2 inline-block w-fit rounded-full bg-save-tint px-2 py-0.5 text-xs font-medium text-save">
          Экономия {formatMoney(product.saving)}
        </span>
      )}

      {!unlocked && (
        <p className="mt-1 text-xs text-muted">
          Есть код Computerra? Введите его, чтобы увидеть цену со скидкой.
        </p>
      )}

      {!outOfStock ? (
        <button
          type="button"
          onClick={() => setReserving((v) => !v)}
          className="mt-3 w-full rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {reserving ? "Закрыть" : "Забронировать"}
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

      {reserving && !isMobile && (
        <ReserveForm
          product={product}
          appliedCode={appliedCode}
          onClose={() => setReserving(false)}
        />
      )}

      {reserving && isMobile && (
        <BottomSheet
          onClose={() => setReserving(false)}
          labelledBy={reserveSheetTitleId}
        >
          <h3
            id={reserveSheetTitleId}
            className="mb-3 font-display text-base font-semibold text-ink"
          >
            Забронировать «{product.name}»
          </h3>
          <ReserveForm
            product={product}
            appliedCode={appliedCode}
            onClose={() => setReserving(false)}
            embedded
          />
        </BottomSheet>
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

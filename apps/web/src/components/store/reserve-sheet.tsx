"use client";

import Image from "next/image";
import { imageSrc } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useIsMobile } from "@/lib/use-is-mobile";
import type { AppliedCode } from "@/lib/use-applied-code";
import type { Product, Selection } from "@/lib/types";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SideDrawer } from "@/components/ui/side-drawer";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { CategoryIcon } from "./category-icon";
import { ReserveForm } from "./reserve-form";

// Reserve flow: slides up from the bottom on phone, in from the right on
// laptop — picked from the same breakpoint the CSS uses (useIsMobile).
export function ReserveSheet({
  product,
  selection,
  appliedCode,
  onClose,
}: {
  product: Product;
  selection: Selection;
  appliedCode: AppliedCode | null;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const titleId = `reserve-${product.id}`;
  const colorImages = product.colors.find((c) => c.name === selection.color)?.images ?? [];
  const cover = imageSrc(colorImages[0] ?? product.images[0]);
  const variant = [selection.color, selection.config].filter(Boolean).join(" · ");

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 id={titleId} className="font-display text-2xl font-bold text-ink">
          Бронирование
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-ink hover:bg-sunken"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-bg p-2.5">
        <div className="relative flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-muted">
          {cover ? (
            <Image src={cover} alt="" fill unoptimized sizes="64px" className="object-contain p-1" />
          ) : (
            <CategoryIcon name={product.category ?? ""} className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{product.name}</p>
          {(variant || product.category) && (
            <p className="text-xs text-muted">{variant || product.category}</p>
          )}
        </div>
        <span className="tabular shrink-0 font-display font-bold text-save">
          {formatMoney(selection.price.memberPrice)}
        </span>
      </div>

      {appliedCode && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-save-tint px-4 py-3 text-sm text-save-strong">
          <CheckIcon className="h-4 w-4 shrink-0" />
          <span>
            <b className="tabular">{appliedCode.code}</b> применён
          </span>
        </div>
      )}

      <ReserveForm product={product} selection={selection} appliedCode={appliedCode} onClose={onClose} />
    </div>
  );

  return isMobile ? (
    <BottomSheet onClose={onClose} labelledBy={titleId}>
      {content}
    </BottomSheet>
  ) : (
    <SideDrawer onClose={onClose} labelledBy={titleId}>
      {content}
    </SideDrawer>
  );
}

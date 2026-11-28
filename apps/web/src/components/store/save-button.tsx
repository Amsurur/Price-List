"use client";

import { HeartIcon } from "@/components/ui/icons";
import { useSaved } from "@/lib/use-saved";

// Heart toggle for a product. `floating` sits over a card's photo.
export function SaveButton({
  productId,
  productName,
  variant = "floating",
}: {
  productId: string;
  productName: string;
  variant?: "floating" | "inline";
}) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(productId);
  const label = saved ? `Убрать «${productName}» из сохранённых` : `Сохранить «${productName}»`;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggle(productId)}
        aria-pressed={saved}
        aria-label={label}
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-colors ${
          saved ? "border-danger/30 bg-danger/10 text-danger" : "border-line bg-surface text-ink hover:bg-bg"
        }`}
      >
        <HeartIcon filled={saved} className="h-6 w-6" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors ${
        saved ? "bg-surface text-danger" : "bg-surface/80 text-ink-soft hover:text-ink"
      }`}
    >
      <HeartIcon filled={saved} className="h-5 w-5" />
    </button>
  );
}

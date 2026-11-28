import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

// A horizontal, swipeable row of cards ("Новинки", "Хиты продаж").
export function ProductRow({
  title,
  products,
  href,
}: {
  title: string;
  products: Product[];
  href?: string;
}) {
  if (products.length < 2) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-brand-strong hover:underline">
            Весь каталог →
          </Link>
        )}
      </div>
      {/* A scrolling row clips anything that sticks out of it, including a
          card lifting on hover. The padding gives the lift room; the
          matching negative margin keeps the layout where it was. */}
      <ul className="no-scrollbar -mx-3 -my-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3 py-3 sm:-mx-2 sm:gap-4 sm:px-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} className="h-auto! w-[46%] shrink-0 snap-start sm:w-[calc(25%-12px)]" />
        ))}
      </ul>
    </section>
  );
}

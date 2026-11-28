import Image from "next/image";
import Link from "next/link";
import { imageSrc } from "@/lib/api";
import type { Product } from "@/lib/types";
import { CategoryIcon } from "./category-icon";
import { DiscountBadge, ProductPrice, StockLabel } from "./product-price";
import { SaveButton } from "./save-button";

// A catalogue tile. The whole card opens the product page; the price shown is
// whatever the API priced for the current code (member price in green).
export function ProductCard({ product, className = "" }: { product: Product; className?: string }) {
  const cover = imageSrc(product.images[0]);
  const second = imageSrc(product.images[1]);
  const outOfStock = product.stock <= 0;

  return (
    <li className={`relative h-full ${className}`}>
      <Link
        href={`/p/${product.id}`}
        className={`group flex h-full flex-col gap-3 rounded-3xl border border-line bg-surface p-2.5 pb-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10 ${
          outOfStock ? "opacity-70" : ""
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-bg">
          {cover ? (
            <>
              <Image
                src={cover}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 300px"
                className={`object-contain p-3 transition-opacity duration-300 ${
                  second ? "group-hover:opacity-0" : ""
                }`}
              />
              {second && (
                <Image
                  src={second}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 300px"
                  className="object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <CategoryIcon name={product.category ?? ""} className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            <DiscountBadge product={product} />
            {product.salePercent > 0 && (
              <span className="rounded-full bg-warn px-2.5 py-1 text-xs font-bold text-white">Акция</span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-1.5">
          {(product.brand || product.category) && (
            <span className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              {product.brand || product.category}
            </span>
          )}
          <h3
            title={product.name}
            className="line-clamp-2 min-h-[2.6em] text-[15px] leading-snug font-semibold text-ink"
          >
            {product.name}
          </h3>
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1" aria-label={`${product.colors.length} цвета`}>
              {product.colors.slice(0, 5).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-line"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}
          <div className="mt-auto flex flex-wrap-reverse items-end justify-between gap-x-2 gap-y-1 pt-2">
            <ProductPrice product={product} />
            <StockLabel product={product} />
          </div>
        </div>

        <span
          className={`mx-1.5 flex h-11 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors ${
            outOfStock
              ? "bg-bg text-muted"
              : "bg-brand-tint text-brand-strong group-hover:bg-brand group-hover:text-white"
          }`}
        >
          {outOfStock ? "Нет в наличии" : "Забронировать"}
        </span>
      </Link>
      {/* Outside the link: a button can't sit inside an <a>. */}
      <div className="absolute top-4 right-4">
        <SaveButton productId={product.id} productName={product.name} />
      </div>
    </li>
  );
}

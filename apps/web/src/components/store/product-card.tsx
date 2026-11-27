import Image from "next/image";
import Link from "next/link";
import { imageSrc } from "@/lib/api";
import type { Product } from "@/lib/types";
import { CategoryIcon } from "./category-icon";
import { DiscountBadge, ProductPrice, StockLabel } from "./product-price";

// A catalogue tile. The whole card opens the product page; the price shown is
// whatever the API priced for the current code (member price in green).
export function ProductCard({ product }: { product: Product }) {
  const cover = imageSrc(product.images[0]);
  const second = imageSrc(product.images[1]);
  const outOfStock = product.stock <= 0;

  return (
    <li className="h-full">
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
          <div className="absolute top-2 left-2 flex gap-1.5">
            <DiscountBadge product={product} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-1.5">
          {product.category && (
            <span className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              {product.category}
            </span>
          )}
          <h3
            title={product.name}
            className="line-clamp-2 min-h-[2.6em] text-[15px] leading-snug font-semibold text-ink"
          >
            {product.name}
          </h3>
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
    </li>
  );
}

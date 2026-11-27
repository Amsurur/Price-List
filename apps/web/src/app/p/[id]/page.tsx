"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { imageSrc, listProducts } from "@/lib/api";
import { catalogHref, categoriesOf } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { useAppliedCode } from "@/lib/use-applied-code";
import type { Product, Selection, VariantPrice } from "@/lib/types";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ClockIcon, StoreIcon } from "@/components/ui/icons";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { CodeUnlockStrip } from "@/components/store/code-unlock-strip";
import { CategoryIcon } from "@/components/store/category-icon";
import { ImageLightbox } from "@/components/store/image-lightbox";
import { ProductCard } from "@/components/store/product-card";
import { PRODUCT_GRID } from "@/components/store/product-grid-skeleton";
import { ReserveSheet } from "@/components/store/reserve-sheet";
import { DiscountBreakdown, StockLabel } from "@/components/store/product-price";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; products: Product[] };

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { appliedCode, ready, apply, remove } = useAppliedCode();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [reserveOpen, setReserveOpen] = useState(false);
  // Picked options; null means "the default" (the first of each).
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [pickedConfig, setPickedConfig] = useState<string | null>(null);
  // Opening another product (e.g. from "Похожие товары") starts fresh.
  const [shownId, setShownId] = useState(id);
  if (shownId !== id) {
    setShownId(id);
    setPickedColor(null);
    setPickedConfig(null);
    setReserveOpen(false);
  }
  const [attempt, setAttempt] = useState(0);

  // The public listing is the only endpoint that prices for a code, and it
  // also gives us related products — so load it and pick this one out.
  const code = appliedCode?.code;
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    listProducts({ active: true, code })
      .then((products) => !cancelled && setState({ kind: "ready", products }))
      .catch((err: unknown) => {
        if (!cancelled)
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : "Не удалось загрузить товар",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [ready, code, attempt]);

  const products = useMemo(() => (state.kind === "ready" ? state.products : []), [state]);
  const product = products.find((p) => p.id === id) ?? null;
  const categories = useMemo(() => categoriesOf(products).map((c) => c.name), [products]);

  const selection = useMemo<Selection | null>(() => {
    if (!product) return null;
    const color = pickedColor ?? product.colors[0]?.name ?? null;
    const config = pickedConfig ?? product.configs[0]?.label ?? null;
    const price =
      product.variants.find((v) => v.color === color && v.config === config) ?? product.variants[0];
    return price ? { color, config, price } : null;
  }, [product, pickedColor, pickedConfig]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const own = product.colors.find((c) => c.name === selection?.color)?.images ?? [];
    return own.length > 0 ? own : product.images;
  }, [product, selection]);

  const related = useMemo(() => {
    if (!product) return [];
    const others = products.filter((p) => p.id !== product.id && p.stock > 0);
    const same = others.filter((p) => p.category && p.category === product.category);
    const rest = others.filter((p) => !same.includes(p));
    return [...same, ...rest].slice(0, 4);
  }, [products, product]);

  useEffect(() => {
    if (product) document.title = `${product.name} — Computerra Store`;
  }, [product]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <StoreHeader
        categories={categories}
        activeCategory={product?.category ?? null}
        appliedCode={appliedCode}
      />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-3 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-0">
        {state.kind === "loading" && <ProductSkeleton />}

        {state.kind === "error" && (
          <div className="rounded-3xl border border-danger/30 bg-danger/5 px-4 py-16 text-center">
            <p className="text-sm text-danger">{state.message}</p>
            <button
              onClick={() => {
                setState({ kind: "loading" });
                setAttempt((n) => n + 1);
              }}
              className="mt-4 h-11 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink"
            >
              Повторить
            </button>
          </div>
        )}

        {state.kind === "ready" && !product && (
          <div className="rounded-3xl border border-line bg-surface px-4 py-20 text-center">
            <p className="font-display text-xl font-semibold text-ink">Товар не найден</p>
            <p className="mt-1 text-sm text-muted">Возможно, его уже сняли с продажи.</p>
            <Link
              href="/#catalog"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
            >
              В каталог
            </Link>
          </div>
        )}

        {product && selection && (
          <>
            <nav aria-label="Навигация" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <Link href="/" className="hover:text-ink">
                Главная
              </Link>
              {product.category && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={catalogHref(product.category)} className="hover:text-ink">
                    {product.category}
                  </Link>
                </>
              )}
              <span aria-hidden="true">/</span>
              <span className="line-clamp-1 text-ink-soft">{product.name}</span>
            </nav>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
              <Gallery
                key={`${product.id}-${selection.color ?? ""}`}
                product={product}
                images={galleryImages}
                discount={percentOf(selection.price)}
              />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  {(product.brand || product.category) && (
                    <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                      {[product.brand, product.category].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight text-ink sm:text-4xl">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {product.stock > 0 && !product.stockLabel && (
                      <span className="rounded-full bg-save-tint px-2.5 py-1 text-xs font-medium text-save-strong">
                        В наличии
                      </span>
                    )}
                    <StockLabel product={product} />
                    {product.tags.map((t) => (
                      <span key={t} className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {product.colors.length > 0 && (
                  <OptionGroup label="Цвет" value={selection.color}>
                    {product.colors.map((c) => (
                      <OptionButton
                        key={c.name}
                        active={c.name === selection.color}
                        onClick={() => setPickedColor(c.name)}
                        extra={c.extraPrice}
                      >
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 rounded-full border border-line"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </OptionButton>
                    ))}
                  </OptionGroup>
                )}

                {product.configs.length > 0 && (
                  <OptionGroup label="Конфигурация" value={selection.config}>
                    {product.configs.map((c) => (
                      <OptionButton
                        key={c.label}
                        active={c.label === selection.config}
                        onClick={() => setPickedConfig(c.label)}
                        extra={c.extraPrice}
                      >
                        {c.label}
                      </OptionButton>
                    ))}
                  </OptionGroup>
                )}

                <PriceCard price={selection.price} hasCode={Boolean(appliedCode)} />
                <DiscountBreakdown product={product} appliedCode={appliedCode} />

                <CodeUnlockStrip
                  variant="compact"
                  applied={appliedCode}
                  onApply={apply}
                  onRemove={remove}
                />

                <button
                  type="button"
                  onClick={() => setReserveOpen(true)}
                  disabled={product.stock <= 0}
                  className="hidden h-14 rounded-full bg-brand font-display text-base font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50 sm:block"
                >
                  {product.stock > 0 ? "Забронировать" : "Нет в наличии"}
                </button>

                <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <Perk icon={<CheckIcon className="h-4 w-4" />} title="Бронь бесплатно" text="Ни к чему не обязывает" />
                  <Perk icon={<StoreIcon className="h-4 w-4" />} title="Оплата в магазине" text="Без предоплаты" />
                  <Perk icon={<ClockIcon className="h-4 w-4" />} title="Мы свяжемся" text="Чтобы договориться о выдаче" />
                </ul>
              </div>
            </div>

            {product.specs.length > 0 && (
              <section className="mt-6 rounded-3xl bg-surface p-5 sm:mt-8 sm:p-8">
                <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Характеристики</h2>
                <dl className="mt-4 grid gap-x-10 sm:grid-cols-2">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex justify-between gap-4 border-b border-dashed border-line py-3 text-[15px]"
                    >
                      <dt className="text-muted">{spec.label}</dt>
                      <dd className="text-right font-medium text-ink">{spec.value}</dd>
                    </div>
                  ))}
                  {(selection.color || selection.config) && (
                    <div className="flex justify-between gap-4 border-b border-dashed border-line py-3 text-[15px]">
                      <dt className="text-muted">Выбрано</dt>
                      <dd className="text-right font-medium text-brand-strong">
                        {[selection.color, selection.config].filter(Boolean).join(" · ")}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {product.description && (
              <section className="mt-6 rounded-3xl bg-surface p-5 sm:mt-8 sm:p-8">
                <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Описание</h2>
                <p className="mt-3 max-w-3xl text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">
                  {product.description}
                </p>
              </section>
            )}

            {related.length > 0 && (
              <section className="mt-8 flex flex-col gap-4">
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Похожие товары</h2>
                <ul className={PRODUCT_GRID}>
                  {related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </ul>
              </section>
            )}

            {/* Phone: price + reserve stay within thumb reach. */}
            <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
              <div className="flex min-w-0 flex-col">
                {selection.price.saving > 0 && (
                  <span className="tabular text-xs text-muted line-through">
                    {formatMoney(selection.price.price)}
                  </span>
                )}
                <span
                  className={`tabular font-display text-xl font-bold ${
                    selection.price.saving > 0 ? "text-save" : "text-ink"
                  }`}
                >
                  {formatMoney(selection.price.memberPrice)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReserveOpen(true)}
                disabled={product.stock <= 0}
                className="ml-auto h-12 flex-1 rounded-full bg-brand font-display text-[15px] font-semibold text-white disabled:opacity-50"
              >
                {product.stock > 0 ? "Забронировать" : "Нет в наличии"}
              </button>
            </div>

            {reserveOpen && (
              <ReserveSheet product={product} selection={selection} appliedCode={appliedCode} onClose={() => setReserveOpen(false)} />
            )}
          </>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

function percentOf(price: VariantPrice): number {
  return price.price > 0 ? Math.round((price.saving / price.price) * 100) : 0;
}

function PriceCard({ price, hasCode }: { price: VariantPrice; hasCode: boolean }) {
  const discounted = price.saving > 0;
  return (
    <div className="rounded-3xl border border-line bg-surface p-5" aria-live="polite">
      {discounted ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-save-strong">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-save font-display text-[11px] font-bold text-white"
              >
                S
              </span>
              {hasCode ? "Ваша цена по коду" : "Цена со скидкой"}
            </div>
            <div className="tabular mt-1 font-display text-4xl font-bold tracking-tight text-save sm:text-5xl">
              {formatMoney(price.memberPrice)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="tabular text-sm text-muted line-through">{formatMoney(price.price)}</span>
            <span className="tabular rounded-full bg-save-tint px-2.5 py-1 text-xs font-semibold text-save-strong">
              −{percentOf(price)}% · экономия {formatMoney(price.saving)}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-sm text-muted">Цена</div>
          <div className="tabular mt-1 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {formatMoney(price.price)}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionGroup({
  label,
  value,
  children,
}: {
  label: string;
  value: string | null;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        {label}: <span className="font-semibold text-ink">{value}</span>
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  extra,
  children,
}: {
  active: boolean;
  onClick: () => void;
  extra: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-11 items-center gap-2 rounded-2xl border-2 px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? "border-brand bg-brand-tint text-ink" : "border-line bg-surface text-ink-soft hover:border-ink-soft"
      }`}
    >
      {children}
      {extra > 0 && <span className="tabular text-xs text-muted">+{formatMoney(extra)}</span>}
    </button>
  );
}

function Perk({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-start gap-2.5 rounded-2xl bg-surface p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
    </li>
  );
}

function Gallery({
  product,
  images,
  discount,
}: {
  product: Product;
  images: string[];
  discount: number;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = imageSrc(images[index]);
  const multi = images.length > 1;

  function step(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface sm:aspect-[5/4]">
        {current ? (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Открыть фото на весь экран"
            className="absolute inset-0 cursor-zoom-in"
          >
            <Image src={current} alt={product.name} fill unoptimized sizes="(max-width: 1024px) 100vw, 640px" className="object-contain p-6 sm:p-10" />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <CategoryIcon name={product.category ?? ""} className="h-20 w-20" />
          </div>
        )}
        {discount > 0 && (
          <span className="tabular absolute top-4 left-4 rounded-full bg-save px-3 py-1.5 text-sm font-bold text-white">
            −{discount}%
          </span>
        )}
        {multi && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Предыдущее фото"
              className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-md hover:bg-surface"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Следующее фото"
              className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-md hover:bg-surface"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <span className="tabular absolute right-4 bottom-4 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {multi && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((url, i) => {
            const src = imageSrc(url);
            return (
              <button
                key={url + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-surface transition-colors ${
                  i === index ? "border-brand" : "border-transparent hover:border-line"
                }`}
              >
                {src && <Image src={src} alt="" fill unoptimized sizes="80px" className="object-contain p-1.5" />}
              </button>
            );
          })}
        </div>
      )}

      {lightbox && <ImageLightbox images={images} startIndex={index} onClose={() => setLightbox(false)} />}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-8" aria-label="Загружаем товар">
      <div className="aspect-square animate-pulse rounded-3xl bg-surface sm:aspect-[5/4]" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-surface" />
        <div className="h-10 w-4/5 animate-pulse rounded-xl bg-surface" />
        <div className="h-32 animate-pulse rounded-3xl bg-surface" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
        <div className="h-14 animate-pulse rounded-full bg-surface" />
      </div>
    </div>
  );
}

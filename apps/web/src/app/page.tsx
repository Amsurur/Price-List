"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { imageSrc, listProducts } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { brandsOf, catalogHref, categoriesOf, plural } from "@/lib/categories";
import { useAppliedCode } from "@/lib/use-applied-code";
import type { Product } from "@/lib/types";
import { FilterIcon, SearchIcon } from "@/components/ui/icons";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { CodeUnlockStrip } from "@/components/store/code-unlock-strip";
import { CategoryIcon } from "@/components/store/category-icon";
import { ProductCard } from "@/components/store/product-card";
import { TagFilterChips } from "@/components/store/tag-filter-chips";
import { SortSelect, type SortOption } from "@/components/store/sort-select";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import {
  CatalogFilters,
  NO_FILTERS,
  activeFilterCount,
  matchesFilters,
  type Filters,
} from "@/components/store/catalog-filters";
import { ProductRow } from "@/components/store/product-row";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Reveal } from "@/components/ui/reveal";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; products: Product[] };

export default function Home() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = params.get("category");
  const urlQuery = params.get("q") ?? "";

  const { appliedCode, ready, apply, remove } = useAppliedCode();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [search, setSearch] = useState(urlQuery);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("featured");

  // The header's search box navigates here with ?q=…; mirror it. A new
  // category starts with no tag filter. (Adjusting state during render.)
  const [seen, setSeen] = useState({ q: urlQuery, category: activeCategory });
  if (seen.q !== urlQuery || seen.category !== activeCategory) {
    if (seen.q !== urlQuery) setSearch(urlQuery);
    if (seen.category !== activeCategory) {
      setActiveTag(null);
      setActiveBrand(null);
      setFilters(NO_FILTERS);
    }
    setSeen({ q: urlQuery, category: activeCategory });
  }

  const code = appliedCode?.code;
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    listProducts({ active: true, code })
      .then((products) => !cancelled && setState({ kind: "ready", products }))
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Не удалось загрузить товары",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [ready, code]);

  // A link to /#catalog lands before products load, so the browser scrolls
  // to a still-empty section. Once the catalogue is in, scroll there again.
  const loaded = state.kind === "ready";
  useEffect(() => {
    if (loaded && window.location.hash === "#catalog") {
      document.getElementById("catalog")?.scrollIntoView();
    }
  }, [loaded]);

  function retry() {
    setState({ kind: "loading" });
    listProducts({ active: true, code })
      .then((products) => setState({ kind: "ready", products }))
      .catch((err: unknown) =>
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Не удалось загрузить товары",
        }),
      );
  }

  const products = useMemo(() => (state.kind === "ready" ? state.products : []), [state]);
  const categories = useMemo(() => categoriesOf(products), [products]);

  const inCategory = useMemo(
    () => (activeCategory ? products.filter((p) => p.category === activeCategory) : products),
    [products, activeCategory],
  );

  const brands = useMemo(() => brandsOf(inCategory), [inCategory]);

  // A category's tile shows the first product photo found in it.
  function coverOf(category: string): string | null {
    const withPhoto = products.find((p) => p.category === category && p.images.length > 0);
    return imageSrc(withPhoto?.images[0]);
  }

  // The most-used tags in view, so the chip row stays short.
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    inCategory.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
      .slice(0, 12)
      .map(([t]) => t);
  }, [inCategory]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = inCategory.filter((p) => {
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      const matchesBrand = !activeBrand || p.brand === activeBrand;
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term) ||
        (p.category ?? "").toLowerCase().includes(term) ||
        (p.brand ?? "").toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term));
      return matchesTag && matchesBrand && matchesSearch && matchesFilters(p, filters);
    });
    const sorted = [...matches];
    if (sort === "price-asc") sorted.sort((a, b) => a.memberPrice - b.memberPrice);
    else if (sort === "price-desc") sorted.sort((a, b) => b.memberPrice - a.memberPrice);
    else if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    // "featured" keeps the API's order (the admin's drag-and-drop order).
    return sorted;
  }, [inCategory, search, activeTag, activeBrand, filters, sort]);

  const filterCount = activeFilterCount(filters);
  const filtering = Boolean(
    activeCategory || search.trim() || activeTag || activeBrand || filterCount,
  );

  // Home-page rows, shown while the student is just browsing.
  const newest = useMemo(
    () => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [products],
  );
  const popular = useMemo(
    () =>
      products
        .filter((p) => p.popularity > 0)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 8),
    [products],
  );

  function resetFilters() {
    setSearch("");
    setActiveTag(null);
    setActiveBrand(null);
    setFilters(NO_FILTERS);
    router.replace("/#catalog", { scroll: false });
  }

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  }


  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <StoreHeader
        categories={categories.map((c) => c.name)}
        activeCategory={activeCategory}
        appliedCode={appliedCode}
      />

      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-5 px-3 pt-4 sm:gap-8 sm:px-6 sm:pt-6">
        {/* Hero: search first, plus what students reserve most. */}
        <section className="grid gap-6 rounded-3xl border border-line bg-surface p-5 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-ink sm:text-[40px]">
              Ноутбуки, мониторы и аксессуары
            </h1>
            <p className="max-w-lg text-[15px] text-ink-soft">
              Студенты Softclub получают скидку по личному коду. Бронируйте на сайте, оплачивайте
              и забирайте в магазине.
            </p>
            <form
              onSubmit={handleHeroSearch}
              role="search"
              className="flex h-12 max-w-xl items-center gap-2 rounded-full border border-line bg-bg pr-1 pl-4 focus-within:border-brand"
            >
              <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Название, бренд или категория"
                aria-label="Поиск техники"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted focus-visible:outline-none"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                Найти
              </button>
            </form>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((c) => (
                  <Link
                    key={c.name}
                    href={catalogHref(c.name)}
                    className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-ink-soft hover:border-ink-soft hover:text-ink"
                  >
                    {c.name}
                    <span className="tabular text-xs text-muted">{c.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <TopPicks products={popular.length ? popular : newest} title={popular.length ? "Чаще всего бронируют" : "Новое в каталоге"} />
        </section>

        <CodeUnlockStrip applied={appliedCode} onApply={apply} onRemove={remove} />

        {/* Categories */}
        {categories.length > 1 && (
          <Reveal as="section" className="flex flex-col gap-4">
            <h2 id="cats-title" className="font-display text-2xl font-bold tracking-tight text-ink">
              Категории
            </h2>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
              {categories.map((c) => (
                <li key={c.name}>
                  <Link
                    href={catalogHref(c.name)}
                    className={`flex h-full flex-col gap-3 rounded-2xl border p-2.5 pb-3 transition-colors ${
                      activeCategory === c.name
                        ? "border-brand bg-brand-tint"
                        : "border-line bg-surface hover:border-ink-soft"
                    }`}
                  >
                    <CategoryCover name={c.name} src={coverOf(c.name)} />
                    <span className="px-1">
                      <span className="block text-sm font-semibold text-ink">{c.name}</span>
                      <span className="tabular text-xs text-muted">
                        {c.count} {plural(c.count, "товар", "товара", "товаров")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {state.kind === "ready" && !filtering && (
          <>
            <Reveal>
              <ProductRow title="Хиты продаж" products={popular} />
            </Reveal>
            <Reveal>
              <ProductRow title="Новинки" products={newest} />
            </Reveal>
          </>
        )}

        {/* Catalogue */}
        <section id="catalog" aria-labelledby="catalog-title" className="flex scroll-mt-32 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="catalog-title" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {[activeBrand, activeCategory].filter(Boolean).join(" · ") || "Весь каталог"}
              </h2>
              {state.kind === "ready" && (
                <p className="tabular text-sm text-muted">
                  {filtered.length} {plural(filtered.length, "товар", "товара", "товаров")}
                  {appliedCode ? " · цены с вашим кодом" : ""}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink lg:hidden"
              >
                <FilterIcon className="h-4 w-4" />
                Фильтры
                {filterCount > 0 && (
                  <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] text-white">
                    {filterCount}
                  </span>
                )}
              </button>
              {filtering && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-10 rounded-full px-4 text-sm font-semibold text-brand-strong hover:bg-brand-tint"
                >
                  Сбросить
                </button>
              )}
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          {brands.length > 1 && (
            <ul aria-label="Бренды" className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
              {brands.map((b) => {
                const on = activeBrand === b.name;
                return (
                  <li key={b.name} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActiveBrand(on ? null : b.name)}
                      className={`flex h-16 w-24 flex-col items-center justify-center rounded-2xl border transition-colors sm:w-full ${
                        on ? "border-brand bg-brand-tint" : "border-line bg-surface hover:border-brand/40"
                      }`}
                    >
                      <span className="font-display text-[15px] font-bold text-ink">{b.name}</span>
                      <span className="tabular text-[11px] text-muted">{b.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {allTags.length > 0 && (
            <TagFilterChips tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
          )}

          <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside aria-label="Фильтры" className="sticky top-32 hidden rounded-3xl border border-line bg-surface p-5 lg:block">
            <CatalogFilters products={inCategory} value={filters} onChange={setFilters} />
          </aside>
          <div className="min-w-0">
          {state.kind === "loading" && <ProductGridSkeleton count={6} />}

          {state.kind === "error" && (
            <div className="rounded-3xl border border-danger/30 bg-danger/5 px-4 py-14 text-center">
              <p className="text-sm text-danger">{state.message}</p>
              <button
                onClick={retry}
                className="mt-4 h-11 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-bg"
              >
                Повторить
              </button>
            </div>
          )}

          {state.kind === "ready" && filtered.length === 0 && (
            <div className="rounded-3xl border border-line bg-surface px-4 py-16 text-center">
              <p className="font-display text-lg font-semibold text-ink">
                {products.length === 0 ? "Товары скоро появятся" : "Ничего не нашлось"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {products.length === 0
                  ? "Мы наполняем каталог. Загляните чуть позже."
                  : "Попробуйте другой запрос или сбросьте фильтры."}
              </p>
              {products.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-4 h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}

          {state.kind === "ready" && filtered.length > 0 && (
            <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ul>
          )}
          </div>
          </div>
        </section>

        {filtersOpen && (
          <BottomSheet onClose={() => setFiltersOpen(false)} labelledBy="filters-title">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 id="filters-title" className="font-display text-xl font-bold text-ink">
                  Фильтры
                </h2>
              </div>
              <CatalogFilters products={inCategory} value={filters} onChange={setFilters} />
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="h-12 rounded-full bg-brand font-display text-sm font-semibold text-white"
              >
                Показать {filtered.length} {plural(filtered.length, "товар", "товара", "товаров")}
              </button>
            </div>
          </BottomSheet>
        )}

        <Reveal>
          <HowItWorks />
        </Reveal>
      </main>

      <StoreFooter />
    </div>
  );
}

function CategoryCover({ name, src }: { name: string; src: string | null }) {
  return (
    <span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-bg text-muted">
      {src ? (
        <Image src={src} alt="" fill unoptimized sizes="200px" className="object-contain p-2" />
      ) : (
        <CategoryIcon name={name} className="h-10 w-10" />
      )}
    </span>
  );
}

// The hero's right column: three real products, linked.
function TopPicks({ products, title }: { products: Product[]; title: string }) {
  const picks = products.slice(0, 3);
  if (picks.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
        {picks.map((p) => {
          const cover = imageSrc(p.images[0]);
          return (
            <li key={p.id}>
              <Link href={`/p/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-bg">
                <span className="relative flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bg text-muted">
                  {cover ? (
                    <Image src={cover} alt="" fill unoptimized sizes="56px" className="object-contain p-1" />
                  ) : (
                    <CategoryIcon name={p.category ?? ""} className="h-6 w-6" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium text-ink">{p.name}</span>
                  <span className="text-xs text-muted">{p.brand || p.category}</span>
                </span>
                <span className={`tabular shrink-0 text-sm font-semibold ${p.saving > 0 ? "text-save" : "text-ink"}`}>
                  {formatMoney(p.memberPrice)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const STEPS = [
  { title: "Введите код", text: "Личный код студента Softclub открывает цену со скидкой." },
  { title: "Забронируйте", text: "Оставьте имя и телефон. Бронь бесплатная и ни к чему не обязывает." },
  { title: "Заберите в магазине", text: "Мы свяжемся с вами. Оплата при получении." },
];

function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-32 rounded-3xl border border-line bg-surface p-5 sm:p-8">
      <h2 id="how-title" className="font-display text-xl font-bold text-ink sm:text-2xl">
        Как купить
      </h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-1">
            <span className="tabular text-sm font-semibold text-brand-strong">Шаг {i + 1}</span>
            <span className="font-semibold text-ink">{s.title}</span>
            <span className="text-sm text-ink-soft">{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

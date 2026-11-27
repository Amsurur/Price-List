"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { listProducts } from "@/lib/api";
import { brandsOf, catalogHref, categoriesOf, plural } from "@/lib/categories";
import { useAppliedCode } from "@/lib/use-applied-code";
import type { Product } from "@/lib/types";
import { SearchIcon } from "@/components/ui/icons";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { CodeUnlockStrip } from "@/components/store/code-unlock-strip";
import { CategoryIcon } from "@/components/store/category-icon";
import { ProductCard } from "@/components/store/product-card";
import { TagFilterChips } from "@/components/store/tag-filter-chips";
import { SortSelect, type SortOption } from "@/components/store/sort-select";
import { PRODUCT_GRID, ProductGridSkeleton } from "@/components/store/product-grid-skeleton";

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
  const [sort, setSort] = useState<SortOption>("featured");

  // The header's search box navigates here with ?q=…; mirror it. A new
  // category starts with no tag filter. (Adjusting state during render.)
  const [seen, setSeen] = useState({ q: urlQuery, category: activeCategory });
  if (seen.q !== urlQuery || seen.category !== activeCategory) {
    if (seen.q !== urlQuery) setSearch(urlQuery);
    if (seen.category !== activeCategory) {
      setActiveTag(null);
      setActiveBrand(null);
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
      return matchesTag && matchesBrand && matchesSearch;
    });
    const sorted = [...matches];
    if (sort === "price-asc") sorted.sort((a, b) => a.memberPrice - b.memberPrice);
    else if (sort === "price-desc") sorted.sort((a, b) => b.memberPrice - a.memberPrice);
    else if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    // "featured" keeps the API's order (the admin's drag-and-drop order).
    return sorted;
  }, [inCategory, search, activeTag, activeBrand, sort]);

  const filtering = Boolean(activeCategory || search.trim() || activeTag || activeBrand);

  function resetFilters() {
    setSearch("");
    setActiveTag(null);
    setActiveBrand(null);
    router.replace("/#catalog", { scroll: false });
  }

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  }

  const maxDiscount = products.reduce((m, p) => Math.max(m, p.memberDiscount), 0);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <StoreHeader
        categories={categories.map((c) => c.name)}
        activeCategory={activeCategory}
        appliedCode={appliedCode}
      />

      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-5 px-3 pt-4 sm:gap-8 sm:px-6 sm:pt-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-brand-tint px-5 py-8 sm:px-10 sm:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-32 h-[420px] w-[420px] rounded-full bg-brand/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-save/15 blur-3xl"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-col gap-5">
              <span className="w-fit rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-brand-strong">
                Скидка для студентов Softclub
              </span>
              <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-tight text-ink sm:text-6xl">
                Техника для учёбы.
                <br />
                <span className="text-brand">Цена — для своих.</span>
              </h1>
              <p className="max-w-md text-[15px] text-ink-soft sm:text-base">
                Ноутбуки, мониторы и аксессуары. Бронируйте онлайн, забирайте и оплачивайте в
                магазине.
              </p>
              <form
                onSubmit={handleHeroSearch}
                role="search"
                className="flex h-14 max-w-lg items-center gap-2 rounded-full bg-surface pr-1.5 pl-5 shadow-lg shadow-brand/10"
              >
                <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Например, MacBook или монитор 27"
                  aria-label="Поиск техники"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted focus-visible:outline-none"
                />
                <button
                  type="submit"
                  className="h-11 shrink-0 rounded-full bg-brand px-5 font-display text-sm font-semibold text-white hover:bg-brand-strong"
                >
                  Найти
                </button>
              </form>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((c) => (
                    <Link
                      key={c.name}
                      href={catalogHref(c.name)}
                      className="flex h-9 items-center gap-2 rounded-full bg-surface/70 px-3.5 text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink"
                    >
                      <CategoryIcon name={c.name} className="h-4 w-4" />
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <HeroSeal maxDiscount={maxDiscount} />
          </div>
        </section>

        <CodeUnlockStrip applied={appliedCode} onApply={apply} onRemove={remove} />

        {/* Categories */}
        {categories.length > 1 && (
          <section aria-labelledby="cats-title" className="flex flex-col gap-4">
            <h2 id="cats-title" className="font-display text-2xl font-bold tracking-tight text-ink">
              Категории
            </h2>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
              {categories.map((c) => (
                <li key={c.name}>
                  <Link
                    href={catalogHref(c.name)}
                    className={`group flex h-full flex-col gap-6 rounded-3xl border p-4 transition-colors ${
                      activeCategory === c.name
                        ? "border-brand bg-brand-tint"
                        : "border-line bg-surface hover:border-brand/40"
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                      <CategoryIcon name={c.name} className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{c.name}</span>
                      <span className="tabular text-xs text-muted">
                        {c.count} {plural(c.count, "товар", "товара", "товаров")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
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
            <div className="flex items-center gap-2">
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

          {state.kind === "loading" && <ProductGridSkeleton />}

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
            <ul className={PRODUCT_GRID}>
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ul>
          )}
        </section>

        <HowItWorks />
      </main>

      <StoreFooter />
    </div>
  );
}

// Decorative right side of the hero: the member seal with a discount tag.
function HeroSeal({ maxDiscount }: { maxDiscount: number }) {
  return (
    <div aria-hidden="true" className="relative hidden h-72 items-center justify-center lg:flex">
      <div className="absolute h-64 w-64 rounded-full border border-dashed border-brand/40" />
      <div className="absolute h-48 w-48 rounded-full border border-brand/20 bg-surface/60" />
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-brand bg-surface font-display text-6xl font-bold text-brand shadow-2xl shadow-brand/30">
        S
      </div>
      {maxDiscount > 0 && (
        <div className="absolute top-6 right-6 rotate-6 rounded-2xl bg-save px-4 py-3 text-white shadow-xl shadow-save/30">
          <div className="text-xs font-medium opacity-80">по коду до</div>
          <div className="tabular font-display text-3xl font-bold">−{maxDiscount}%</div>
        </div>
      )}
      <div className="absolute bottom-8 left-4 -rotate-3 rounded-2xl bg-surface px-4 py-3 shadow-xl shadow-brand/10">
        <div className="text-xs text-muted">Оплата</div>
        <div className="text-sm font-semibold text-ink">в магазине</div>
      </div>
    </div>
  );
}

const STEPS = [
  { title: "Введите код", text: "Личный код студента Softclub открывает цену участника на всех товарах." },
  { title: "Забронируйте", text: "Выберите товар и оставьте имя и телефон. Это бесплатно и ни к чему не обязывает." },
  { title: "Заберите в магазине", text: "Мы свяжемся с вами. Оплата и получение — прямо в магазине." },
];

function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-32 rounded-3xl bg-surface p-5 sm:p-10">
      <h2 id="how-title" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Как купить
      </h2>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-3 rounded-2xl bg-bg p-5">
            <span className="tabular flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display font-bold text-white">
              {i + 1}
            </span>
            <span className="font-display text-lg font-semibold text-ink">{s.title}</span>
            <span className="text-sm text-ink-soft">{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

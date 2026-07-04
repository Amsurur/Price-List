"use client";

import { useEffect, useMemo, useState } from "react";
import { listProducts, validateStudentCode } from "@/lib/api";
import { Seal } from "@/components/seal";
import { ProductCard } from "@/components/store/product-card";
import { TagFilterChips } from "@/components/store/tag-filter-chips";
import { SortSelect, type SortOption } from "@/components/store/sort-select";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import {
  CodeUnlockStrip,
  type AppliedCode,
} from "@/components/store/code-unlock-strip";
import type { Product, ValidateCodeResult } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; products: Product[] };

export default function Home() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("featured");
  const [appliedCode, setAppliedCode] = useState<AppliedCode | null>(null);

  async function fetchProducts(code?: string) {
    try {
      setState({
        kind: "ready",
        products: await listProducts({ active: true, code }),
      });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not load products",
      });
    }
  }

  useEffect(() => {
    fetchProducts();
    // Only on mount — applying/removing a code refetches explicitly below.
  }, []);

  function retry() {
    setState({ kind: "loading" });
    fetchProducts(appliedCode?.code);
  }

  async function handleApplyCode(code: string): Promise<ValidateCodeResult> {
    const result = await validateStudentCode(code);
    if (result.ok) {
      setAppliedCode({
        code: code.trim().toUpperCase(),
        studentName: result.studentName,
      });
      await fetchProducts(code);
    }
    return result;
  }

  function handleRemoveCode() {
    setAppliedCode(null);
    fetchProducts();
  }

  const products = useMemo(
    () => (state.kind === "ready" ? state.products : []),
    [state],
  );

  // Tag chips built from the loaded catalogue.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = products.filter((p) => {
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term) ||
        (p.category ?? "").toLowerCase().includes(term) ||
        p.tags.some((t) => t.includes(term));
      return matchesTag && matchesSearch;
    });

    const sorted = [...matches];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc")
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    // "featured" keeps the API's default order (newest first).
    return sorted;
  }, [products, search, activeTag, sort]);

  function resetFilters() {
    setSearch("");
    setActiveTag(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-3 px-6">
          <Seal />
          <span className="font-display text-lg font-semibold text-ink">
            Softclub Store
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-6 px-6 py-10">
        <CodeUnlockStrip
          applied={appliedCode}
          onApply={handleApplyCode}
          onRemove={handleRemoveCode}
        />

        <div className="flex flex-col gap-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category, or tag"
            aria-label="Search products"
            className="w-full max-w-sm rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {allTags.length > 0 && (
              <TagFilterChips
                tags={allTags}
                activeTag={activeTag}
                onSelect={setActiveTag}
              />
            )}
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        {state.kind === "loading" && <ProductGridSkeleton />}

        {state.kind === "error" && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-12 text-center">
            <p className="text-sm text-danger">{state.message}</p>
            <button
              onClick={retry}
              className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Try again
            </button>
          </div>
        )}

        {state.kind === "ready" && filtered.length === 0 && (
          <div className="rounded-xl border border-line bg-surface px-4 py-16 text-center">
            <p className="text-sm text-muted">
              {products.length === 0
                ? "No products yet — check back soon."
                : "No products match your search."}
            </p>
            {products.length > 0 && (
              <button
                onClick={resetFilters}
                className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {state.kind === "ready" && filtered.length > 0 && (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                unlocked={Boolean(appliedCode)}
              />
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Softclub Store · reserve online, pick up at the shop
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listProducts } from "@/lib/api";
import { categoriesOf, plural } from "@/lib/categories";
import { useAppliedCode } from "@/lib/use-applied-code";
import { useSaved } from "@/lib/use-saved";
import type { Product } from "@/lib/types";
import { HeartIcon } from "@/components/ui/icons";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { ProductCard } from "@/components/store/product-card";
import { PRODUCT_GRID, ProductGridSkeleton } from "@/components/store/product-grid-skeleton";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; products: Product[] };

// Products the student hearted, priced with their code like everywhere else.
export default function SavedPage() {
  const { appliedCode, ready } = useAppliedCode();
  const { ids } = useSaved();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

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
            message: err instanceof Error ? err.message : "Не удалось загрузить товары",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [ready, code, attempt]);

  const all = useMemo(() => (state.kind === "ready" ? state.products : []), [state]);
  // Keep the order they were saved in (newest first); drop removed products.
  const saved = useMemo(
    () => ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)),
    [ids, all],
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <StoreHeader categories={categoriesOf(all).map((c) => c.name)} appliedCode={appliedCode} />
      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-5 px-3 pt-6 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Сохранённые</h1>
          {state.kind === "ready" && saved.length > 0 && (
            <p className="tabular text-sm text-muted">
              {saved.length} {plural(saved.length, "товар", "товара", "товаров")}
              {appliedCode ? " · цены с вашим кодом" : ""}
            </p>
          )}
        </div>

        {state.kind === "loading" && <ProductGridSkeleton count={4} />}

        {state.kind === "error" && (
          <div className="rounded-3xl border border-danger/30 bg-danger/5 px-4 py-14 text-center">
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

        {state.kind === "ready" && saved.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg text-muted">
              <HeartIcon className="h-7 w-7" />
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-ink">Здесь пока пусто</p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Нажмите на сердечко на карточке товара, чтобы сохранить его и сравнить позже.
            </p>
            <Link
              href="/#catalog"
              className="mt-5 flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
            >
              В каталог
            </Link>
          </div>
        )}

        {state.kind === "ready" && saved.length > 0 && (
          <ul className={PRODUCT_GRID}>
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}

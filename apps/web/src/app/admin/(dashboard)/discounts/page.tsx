"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducts, listStudentCodes, updateProduct, updateStudentCode } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { InlineDiscountEditor } from "@/components/admin/inline-discount-editor";
import type { Product, StudentCode } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; products: Product[]; codes: StudentCode[] };

// One screen that surfaces every discount-related setting — the per-product
// standard discount and the per-code extra discount that stacks on top of it
// — so the owner doesn't have to jump between Products and Student codes to
// see the full pricing picture. This is additive: the fields still exist on
// the product form and code row.
export default function DiscountsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  async function load() {
    setState({ kind: "loading" });
    try {
      const [products, codes] = await Promise.all([
        listProducts(),
        listStudentCodes(),
      ]);
      setState({ kind: "ready", products, codes });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Не удалось загрузить скидки",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleProductSaved(updated: Product) {
    setState((prev) =>
      prev.kind === "ready"
        ? {
            ...prev,
            products: prev.products.map((p) =>
              p.id === updated.id ? updated : p,
            ),
          }
        : prev,
    );
  }

  function handleCodeSaved(updated: StudentCode) {
    setState((prev) =>
      prev.kind === "ready"
        ? {
            ...prev,
            codes: prev.codes.map((c) => (c.id === updated.id ? updated : c)),
          }
        : prev,
    );
  }

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Скидки
        </h1>
        <p className="mt-1 text-sm text-muted">
          Все настройки скидок в одном месте — стандартная скидка каждого
          товара и дополнительные скидки по кодам студентов, которые
          складываются с ней.
        </p>
      </div>

      <div className="mt-6">
        {state.kind === "loading" && <SkeletonList />}

        {state.kind === "error" && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-center">
            <p className="text-sm text-danger">{state.message}</p>
            <button
              onClick={load}
              className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Повторить
            </button>
          </div>
        )}

        {state.kind === "ready" && (
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="font-display text-lg font-semibold text-ink">
                Скидки на товары
              </h2>
              <p className="mt-1 text-sm text-muted">
                Стандартная скидка для студентов, применяемая к каждому
                товару, если у кода студента ниже не задано своё значение.
              </p>
              {state.products.length === 0 ? (
                <div className="mt-3 rounded-xl border border-line bg-surface px-4 py-8 text-center">
                  <p className="text-sm text-muted">Пока нет товаров.</p>
                </div>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {state.products.map((product) => (
                    <li
                      key={product.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display font-semibold text-ink">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted">
                          {product.category ?? "Без категории"} ·{" "}
                          {formatMoney(product.price)}
                        </div>
                      </div>
                      <InlineDiscountEditor
                        value={product.memberDiscount}
                        onSave={async (value) => {
                          const updated = await updateProduct(product.id, {
                            memberDiscount: value ?? 0,
                          });
                          handleProductSaved(updated);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    Дополнительные скидки по кодам студентов
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Если задано, этот процент добавляется к скидке товара для
                    всех позиций, которые бронирует этот студент (например,
                    10% товара + 5% кода = 15%). Оставьте пустым, если бонус
                    не нужен.
                  </p>
                </div>
                <Link
                  href="/admin/codes"
                  className="shrink-0 text-sm font-medium text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Управление кодами
                </Link>
              </div>
              {state.codes.length === 0 ? (
                <div className="mt-3 rounded-xl border border-line bg-surface px-4 py-8 text-center">
                  <p className="text-sm text-muted">Пока нет кодов студентов.</p>
                </div>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {state.codes.map((code) => (
                    <li
                      key={code.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display font-semibold text-ink">
                          {code.studentName || "Без имени"}
                        </div>
                        <div className="text-xs text-muted">{code.code}</div>
                      </div>
                      <InlineDiscountEditor
                        value={code.extraDiscount}
                        allowNull
                        onSave={async (value) => {
                          const updated = await updateStudentCode(code.id, {
                            extraDiscount: value,
                          });
                          handleCodeSaved(updated);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-bg" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-bg" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-bg" />
        </div>
      ))}
    </div>
  );
}

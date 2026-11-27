"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducts, listReservations, listStudentCodes } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Product, Reservation, StudentCode } from "@/lib/types";
import { StatusPill, shortWhen } from "@/components/admin/reservation-status";

type Data = {
  products: Product[];
  codes: StudentCode[];
  reservations: Reservation[];
};

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Data };

const LOW_STOCK = 3;

export default function AdminHomePage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  async function load() {
    setState({ kind: "loading" });
    try {
      const [products, codes, reservations] = await Promise.all([
        listProducts(),
        listStudentCodes(),
        listReservations(),
      ]);
      setState({ kind: "ready", data: { products, codes, reservations } });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Не удалось загрузить статистику",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Обзор</h1>
          <p className="mt-1 text-sm text-muted">Что происходит в магазине сейчас.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex h-11 items-center rounded-full bg-brand px-5 font-display text-sm font-semibold text-white hover:bg-brand-strong"
        >
          + Добавить товар
        </Link>
      </div>

      {state.kind === "loading" && <Skeleton />}

      {state.kind === "error" && (
        <div className="rounded-3xl border border-danger/30 bg-danger/5 px-4 py-8 text-center">
          <p className="text-sm text-danger">{state.message}</p>
          <button
            onClick={load}
            className="mt-3 h-10 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-bg"
          >
            Повторить
          </button>
        </div>
      )}

      {state.kind === "ready" && <Dashboard data={state.data} />}
    </div>
  );
}

function Dashboard({ data }: { data: Data }) {
  const { products, codes, reservations } = data;
  const open = reservations.filter((r) => r.status === "new" || r.status === "contacted");
  const fresh = reservations.filter((r) => r.status === "new").length;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const soldThisMonth = reservations.filter(
    (r) => r.status === "completed" && new Date(r.updatedAt).getTime() >= monthStart,
  );
  const revenue = soldThisMonth.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);

  const recent = [...reservations]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const lowStock = products
    .filter((p) => p.active && p.stock <= LOW_STOCK)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  const topCodes = [...codes]
    .filter((c) => c.usesCount > 0)
    .sort((a, b) => b.usesCount - a.usesCount)
    .slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Открытые брони"
          value={String(open.length)}
          hint={fresh ? `${fresh} новых` : "Новых нет"}
          href="/admin/reservations"
          accent
        />
        <StatCard
          label="Выдано за месяц"
          value={String(soldThisMonth.length)}
          hint={formatMoney(revenue)}
          href="/admin/reservations"
        />
        <StatCard
          label="Товары в наличии"
          value={`${products.filter((p) => p.stock > 0).length}`}
          hint={`из ${products.length}`}
          href="/admin/products"
        />
        <StatCard
          label="Активные коды"
          value={String(codes.filter((c) => c.active).length)}
          hint={`всего ${codes.length}`}
          href="/admin/codes"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Последние брони" href="/admin/reservations" linkLabel="Все брони">
          {recent.length === 0 ? (
            <Empty>Броней пока нет. Они появятся, когда студент что-то забронирует.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">
                      {r.studentName || "Без имени"}
                      <span className="ml-2 font-normal text-muted">{r.studentContact}</span>
                    </div>
                    <div className="truncate text-xs text-muted">
                      {r.quantity > 1 ? `${r.quantity} × ` : ""}
                      {r.productName}
                    </div>
                  </div>
                  <span className="tabular hidden text-sm font-semibold text-ink sm:block">
                    {formatMoney(r.unitPrice * r.quantity)}
                  </span>
                  <StatusPill status={r.status} />
                  <span className="hidden w-14 text-right text-xs text-muted sm:block">{shortWhen(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Заканчиваются" href="/admin/products" linkLabel="Товары">
            {lowStock.length === 0 ? (
              <Empty>Всего хватает.</Empty>
            ) : (
              <ul className="flex flex-col gap-2">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-bg px-3 py-2.5 hover:bg-sunken"
                    >
                      <span className="truncate text-sm text-ink">{p.name}</span>
                      <span
                        className={`tabular shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.stock <= 0 ? "bg-danger/10 text-danger" : "bg-warn-tint text-warn"
                        }`}
                      >
                        {p.stock <= 0 ? "нет" : `${p.stock} шт.`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Активные коды" href="/admin/codes" linkLabel="Все коды">
            {topCodes.length === 0 ? (
              <Empty>Коды ещё не использовали.</Empty>
            ) : (
              <ul className="flex flex-col gap-2">
                {topCodes.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="tabular rounded-full bg-save-tint px-2.5 py-0.5 font-semibold text-save-strong">
                      {c.code}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink-soft">{c.studentName ?? ""}</span>
                    <span className="tabular text-muted">{c.usesCount}×</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
  href,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 rounded-3xl p-5 transition-transform hover:-translate-y-0.5 ${
        accent ? "bg-brand text-white" : "border border-line bg-surface text-ink"
      }`}
    >
      <span className={`text-sm ${accent ? "text-white/75" : "text-muted"}`}>{label}</span>
      <span className="tabular font-display text-4xl font-bold tracking-tight">{value}</span>
      <span className={`tabular text-xs ${accent ? "text-white/75" : "text-muted"}`}>{hint}</span>
    </Link>
  );
}

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-brand-strong hover:underline">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-bg px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-80 animate-pulse rounded-3xl bg-surface" />
        <div className="h-80 animate-pulse rounded-3xl bg-surface" />
      </div>
    </div>
  );
}

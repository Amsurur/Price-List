"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducts, listReservations, listStudentCodes } from "@/lib/api";

type Stats = {
  totalProducts: number;
  inStock: number;
  activeCodes: number;
  openReservations: number;
};

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; stats: Stats };

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
      setState({
        kind: "ready",
        stats: {
          totalProducts: products.length,
          inStock: products.filter((p) => p.stock > 0).length,
          activeCodes: codes.filter((c) => c.active).length,
          openReservations: reservations.filter(
            (r) => r.status === "new" || r.status === "contacted",
          ).length,
        },
      });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not load stats",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          A quick look at the shop, at a glance.
        </p>
      </div>

      <div className="mt-6">
        {state.kind === "loading" && <SkeletonGrid />}

        {state.kind === "error" && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-center">
            <p className="text-sm text-danger">{state.message}</p>
            <button
              onClick={load}
              className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Try again
            </button>
          </div>
        )}

        {state.kind === "ready" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Products"
              value={state.stats.totalProducts}
              href="/admin/products"
            />
            <StatCard
              label="In stock"
              value={state.stats.inStock}
              href="/admin/products"
            />
            <StatCard
              label="Active codes"
              value={state.stats.activeCodes}
              href="/admin/codes"
            />
            <StatCard
              label="Open reservations"
              value={state.stats.openReservations}
              href="/admin/reservations"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-line bg-surface p-4 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="font-display text-3xl font-bold tabular text-ink">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-line bg-surface p-4"
        >
          <div className="h-8 w-12 animate-pulse rounded bg-bg" />
          <div className="mt-2 h-3 w-16 animate-pulse rounded bg-bg" />
        </div>
      ))}
    </div>
  );
}

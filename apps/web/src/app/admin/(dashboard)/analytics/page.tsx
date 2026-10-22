"use client";

import { useEffect, useState } from "react";
import { getAnalyticsSummary } from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AnalyticsSummary };

export default function AnalyticsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  async function load() {
    setState({ kind: "loading" });
    try {
      setState({ kind: "ready", data: await getAnalyticsSummary(30) });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Не удалось загрузить аналитику",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Аналитика
        </h1>
        <p className="mt-1 text-sm text-muted">
          Посещаемость витрины за последние 30 дней.
        </p>
      </div>

      <div className="mt-6">
        {state.kind === "loading" && <Skeleton />}

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

        {state.kind === "ready" && state.data.totalViews === 0 && (
          <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center">
            <p className="text-sm text-muted">
              Пока нет данных о посещениях за последние {state.data.days} дней.
            </p>
          </div>
        )}

        {state.kind === "ready" && state.data.totalViews > 0 && (
          <Summary data={state.data} />
        )}
      </div>
    </div>
  );
}

function Summary({ data }: { data: AnalyticsSummary }) {
  const maxDailyViews = Math.max(...data.daily.map((d) => d.views), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm text-muted">Просмотры за {data.days} дней</p>
          <p className="tabular font-display text-3xl font-bold text-ink">
            {data.totalViews}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm text-muted">Уникальные посетители</p>
          <p className="tabular font-display text-3xl font-bold text-ink">
            {data.uniqueVisitors}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">
          Популярные страницы
        </h2>
        <ul className="divide-y divide-line">
          {data.topPaths.map((p) => (
            <li key={p.path} className="flex items-center justify-between py-2">
              <span className="truncate text-sm text-ink">{p.path}</span>
              <span className="tabular text-sm text-muted">{p.views}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">
          Посещения по дням
        </h2>
        <ul className="flex flex-col gap-2">
          {data.daily.map((d) => (
            <li key={d.date} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-muted">{d.date}</span>
              <div className="h-4 flex-1 rounded bg-brand-tint">
                <div
                  className="h-4 rounded bg-brand"
                  style={{ width: `${(d.views / maxDailyViews) * 100}%` }}
                />
              </div>
              <span className="tabular w-10 shrink-0 text-right text-sm text-ink">
                {d.views}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-20 animate-pulse rounded-xl border border-line bg-surface" />
        <div className="h-20 animate-pulse rounded-xl border border-line bg-surface" />
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-line bg-surface" />
    </div>
  );
}

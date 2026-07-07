"use client";

import { useEffect, useMemo, useState } from "react";
import { listStudentCodes, studentCodesExportUrl } from "@/lib/api";
import { CodeRow } from "@/components/admin/code-row";
import { GenerateCodePanel } from "@/components/admin/generate-code-panel";
import type { StudentCode } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; codes: StudentCode[] };

export default function StudentCodesPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [search, setSearch] = useState("");

  async function load() {
    setState({ kind: "loading" });
    try {
      setState({ kind: "ready", codes: await listStudentCodes() });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Не удалось загрузить коды студентов",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const codes = state.kind === "ready" ? state.codes : [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return codes;
    return codes.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        (c.studentName ?? "").toLowerCase().includes(term) ||
        (c.note ?? "").toLowerCase().includes(term),
    );
  }, [codes, search]);

  function handleGenerated(created: StudentCode[]) {
    if (state.kind !== "ready") return;
    setState({ kind: "ready", codes: [...created, ...state.codes] });
  }

  function handleChanged(updated: StudentCode) {
    if (state.kind !== "ready") return;
    setState({
      kind: "ready",
      codes: state.codes.map((c) => (c.id === updated.id ? updated : c)),
    });
  }

  function handleDeleted(id: string) {
    if (state.kind !== "ready") return;
    setState({
      kind: "ready",
      codes: state.codes.filter((c) => c.id !== id),
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Коды студентов
          </h1>
          <p className="mt-1 text-sm text-muted">
            Создавайте коды, задавайте персональные скидки и отслеживайте
            использование.
          </p>
        </div>
        <a
          href={studentCodesExportUrl()}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 font-display text-sm font-semibold text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Экспорт в CSV
        </a>
      </div>

      <div className="mt-6">
        <GenerateCodePanel onGenerated={handleGenerated} />
      </div>

      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по коду, имени или комментарию"
          className="w-full max-w-sm rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
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

        {state.kind === "ready" && filtered.length === 0 && (
          <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center">
            <p className="text-sm text-muted">
              {codes.length === 0
                ? "Пока нет кодов — создайте первый."
                : "Ничего не найдено по вашему запросу."}
            </p>
          </div>
        )}

        {state.kind === "ready" && filtered.length > 0 && (
          <ul className="flex flex-col gap-3">
            {filtered.map((code) => (
              <CodeRow
                key={code.id}
                code={code}
                onChanged={handleChanged}
                onDeleted={handleDeleted}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3"
        >
          <div className="h-7 w-24 animate-pulse rounded-full bg-bg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-bg" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-bg" />
          </div>
        </li>
      ))}
    </ul>
  );
}

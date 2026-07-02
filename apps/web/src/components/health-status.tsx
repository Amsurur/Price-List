"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type State =
  | { kind: "loading" }
  | { kind: "connected"; database: string }
  | { kind: "error"; message: string };

export function HealthStatus() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = (await res.json()) as { database?: string };
        if (!cancelled) {
          setState({ kind: "connected", database: data.database ?? "unknown" });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : "Request failed",
          });
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const dot =
    state.kind === "connected"
      ? "bg-save"
      : state.kind === "error"
        ? "bg-danger"
        : "bg-muted";

  const label =
    state.kind === "loading"
      ? "Checking API…"
      : state.kind === "connected"
        ? `API connected · database ${state.database}`
        : `API not reachable · ${state.message}`;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true" />
      <span className="text-sm text-ink">{label}</span>
      <code className="ml-2 rounded bg-brand-tint px-2 py-0.5 text-xs text-brand-strong">
        {API_URL}/health
      </code>
    </div>
  );
}

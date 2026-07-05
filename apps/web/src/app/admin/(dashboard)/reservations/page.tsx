"use client";

import { useEffect, useMemo, useState } from "react";
import { listReservations } from "@/lib/api";
import { ReservationRow } from "@/components/admin/reservation-row";
import type { Reservation, ReservationStatus } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; reservations: Reservation[] };

const STATUS_FILTERS: { label: string; value: ReservationStatus | null }[] = [
  { label: "All", value: null },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function ReservationsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | null>(
    null,
  );
  const [search, setSearch] = useState("");

  async function load() {
    setState({ kind: "loading" });
    try {
      setState({ kind: "ready", reservations: await listReservations() });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Could not load reservations",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const reservations = state.kind === "ready" ? state.reservations : [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const matchesSearch =
        !term ||
        (r.studentName ?? "").toLowerCase().includes(term) ||
        r.studentContact.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [reservations, statusFilter, search]);

  function handleChanged(updated: Reservation) {
    if (state.kind !== "ready") return;
    setState({
      kind: "ready",
      reservations: state.reservations.map((r) =>
        r.id === updated.id ? updated : r,
      ),
    });
  }

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Reservations
        </h1>
        <p className="mt-1 text-sm text-muted">
          Work new reservations through to completed — that&apos;s the sale.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                statusFilter === f.value
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or contact"
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
              className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg"
            >
              Try again
            </button>
          </div>
        )}

        {state.kind === "ready" && filtered.length === 0 && (
          <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center">
            <p className="text-sm text-muted">
              {reservations.length === 0
                ? "No reservations yet — they'll appear here when a student reserves."
                : "No reservations match your filters."}
            </p>
          </div>
        )}

        {state.kind === "ready" && filtered.length > 0 && (
          <ul className="flex flex-col gap-3">
            {filtered.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                onChanged={handleChanged}
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
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-bg" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-bg" />
          </div>
          <div className="h-7 w-20 animate-pulse rounded-full bg-bg" />
        </li>
      ))}
    </ul>
  );
}

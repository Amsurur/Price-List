"use client";

import { useEffect, useMemo, useState } from "react";
import { listReservations } from "@/lib/api";
import { ReservationRow } from "@/components/admin/reservation-row";
import { ReservationCard } from "@/components/admin/reservation-card";
import { GridIcon, ListIcon } from "@/components/ui/icons";
import type { Reservation, ReservationStatus } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; reservations: Reservation[] };

const STATUS_FILTERS: { label: string; value: ReservationStatus | null }[] = [
  { label: "Все", value: null },
  { label: "Новые", value: "new" },
  { label: "Связались", value: "contacted" },
  { label: "Готовы к выдаче", value: "ready" },
  { label: "Выдано", value: "completed" },
  { label: "Отменено", value: "cancelled" },
];

export default function ReservationsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"board" | "list">("board");

  // Fetches and returns the next page state (no setState here, so the
  // effect below can apply it asynchronously).
  async function fetchState(): Promise<State> {
    try {
      return ({ kind: "ready", reservations: await listReservations() });
    } catch (err) {
      return ({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Не удалось загрузить брони",
      });
    }
  }
  function load() {
    fetchState().then(setState);
  }


  function retry() {
    setState({ kind: "loading" });
    load();
  }

  useEffect(() => {
    fetchState().then(setState);
  }, []);

  const reservations = useMemo(() => (state.kind === "ready" ? state.reservations : []), [state]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const matchesSearch =
        !term ||
        (r.studentName ?? "").toLowerCase().includes(term) ||
        r.studentContact.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term);
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Брони</h1>
          <p className="mt-1 text-sm text-muted">
            Проведите бронь до «Выдано» — это и есть продажа.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Вид" className="flex rounded-full border border-line bg-surface p-1">
            <ViewButton active={view === "board"} onClick={() => setView("board")} label="Доска">
              <GridIcon className="h-4 w-4" />
            </ViewButton>
            <ViewButton active={view === "list"} onClick={() => setView("list")} label="Список">
              <ListIcon className="h-4 w-4" />
            </ViewButton>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Имя, контакт, код или товар"
            aria-label="Поиск броней"
            className="h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-ink outline-none focus:border-brand sm:w-72"
          />
        </div>
      </div>

      {view === "list" && (
        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              aria-pressed={statusFilter === f.value}
              className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "border-ink bg-ink text-surface"
                  : "border-line bg-surface text-ink-soft hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {state.kind === "loading" && <SkeletonList />}

        {state.kind === "error" && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-center">
            <p className="text-sm text-danger">{state.message}</p>
            <button
              onClick={retry}
              className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Повторить
            </button>
          </div>
        )}

        {state.kind === "ready" && view === "board" && reservations.length > 0 && (
          <Board reservations={filtered} onChanged={handleChanged} onShowArchive={(status) => {
            setStatusFilter(status);
            setView("list");
          }} />
        )}

        {state.kind === "ready" && view === "list" && filtered.length === 0 && (
          <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center">
            <p className="text-sm text-muted">
              {reservations.length === 0
                ? "Пока нет броней — они появятся здесь, когда студент забронирует товар."
                : "Ничего не найдено по заданным фильтрам."}
            </p>
          </div>
        )}

        {state.kind === "ready" && view === "board" && reservations.length === 0 && (
          <div className="rounded-3xl border border-line bg-surface px-4 py-12 text-center">
            <p className="text-sm text-muted">
              Пока нет броней — они появятся здесь, когда студент забронирует товар.
            </p>
          </div>
        )}

        {state.kind === "ready" && view === "list" && filtered.length > 0 && (
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

const COLUMNS: { status: ReservationStatus; title: string; dot: string }[] = [
  { status: "new", title: "Новые", dot: "bg-brand" },
  { status: "contacted", title: "Связались", dot: "bg-warn" },
  { status: "ready", title: "Готовы к выдаче", dot: "bg-ink" },
  { status: "completed", title: "Выдано", dot: "bg-save" },
];

// Completed reservations pile up; the board only shows the latest few.
const DONE_LIMIT = 8;

function Board({
  reservations,
  onChanged,
  onShowArchive,
}: {
  reservations: Reservation[];
  onChanged: (updated: Reservation) => void;
  onShowArchive: (status: ReservationStatus) => void;
}) {
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const all = reservations
            .filter((r) => r.status === col.status)
            .sort((a, b) =>
              col.status === "completed"
                ? b.updatedAt.localeCompare(a.updatedAt)
                : a.createdAt.localeCompare(b.createdAt),
            );
          const items = col.status === "completed" ? all.slice(0, DONE_LIMIT) : all;
          return (
            <section
              key={col.status}
              aria-label={col.title}
              className="flex min-w-0 flex-col gap-2.5 rounded-3xl bg-sunken p-3"
            >
              <div className="flex items-center gap-2 px-1.5 py-1">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                <span className="font-semibold text-ink">{col.title}</span>
                <span className="tabular ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-2 text-xs font-bold text-ink">
                  {all.length}
                </span>
              </div>
              {items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
                  Пусто
                </p>
              ) : (
                items.map((r) => <ReservationCard key={r.id} reservation={r} onChanged={onChanged} />)
              )}
              {all.length > items.length && (
                <button
                  type="button"
                  onClick={() => onShowArchive(col.status)}
                  className="h-9 rounded-full text-sm font-semibold text-brand-strong hover:bg-surface"
                >
                  Ещё {all.length - items.length} →
                </button>
              )}
            </section>
          );
        })}
      </div>
      {cancelled > 0 && (
        <button
          type="button"
          onClick={() => onShowArchive("cancelled")}
          className="w-fit text-sm font-medium text-muted hover:text-ink"
        >
          Отменённые: <span className="tabular font-semibold text-ink">{cancelled}</span> →
        </button>
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ${
        active ? "bg-ink text-surface" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
      {label}
    </button>
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

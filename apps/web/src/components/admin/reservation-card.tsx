"use client";

import { useState } from "react";
import { updateReservationStatus } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { CloseIcon } from "@/components/ui/icons";
import { shortWhen } from "./reservation-status";

const NEXT: Partial<Record<ReservationStatus, { status: ReservationStatus; label: string; className: string }>> = {
  new: { status: "contacted", label: "Связались", className: "bg-brand text-white hover:bg-brand-strong" },
  contacted: { status: "completed", label: "Выдано", className: "bg-save text-white hover:bg-save-strong" },
};

// One reservation on the board: who, what, how much, and one tap to move it on.
export function ReservationCard({
  reservation,
  onChanged,
}: {
  reservation: Reservation;
  onChanged: (updated: Reservation) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = NEXT[reservation.status];

  async function transition(status: ReservationStatus) {
    setUpdating(true);
    setError(null);
    try {
      onChanged(await updateReservationStatus(reservation.id, status));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить");
    } finally {
      setUpdating(false);
    }
  }

  const contact = reservation.studentContact.trim();
  const telegram = contact.startsWith("@") ? `https://t.me/${contact.slice(1)}` : null;
  const phone = !telegram && /^[+\d][\d\s()-]{5,}$/.test(contact) ? `tel:${contact.replace(/[^\d+]/g, "")}` : null;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold text-ink">{reservation.studentName || "Без имени"}</div>
          {telegram || phone ? (
            <a href={telegram ?? phone ?? undefined} className="tabular text-xs text-brand-strong hover:underline">
              {contact}
            </a>
          ) : (
            <div className="tabular text-xs text-muted">{contact}</div>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted">{shortWhen(reservation.createdAt)}</span>
      </div>

      <div className="rounded-xl bg-bg px-3 py-2">
        <div className="line-clamp-2 text-sm font-medium text-ink">
          {reservation.quantity > 1 ? `${reservation.quantity} × ` : ""}
          {reservation.productName}
        </div>
        {reservation.variant && <div className="text-xs text-ink-soft">{reservation.variant}</div>}
        {reservation.note && <div className="mt-0.5 text-xs text-muted">«{reservation.note}»</div>}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={`tabular rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            reservation.codeId ? "bg-save-tint text-save-strong" : "bg-bg text-ink-soft"
          }`}
        >
          {reservation.codeId ? reservation.code : "Без кода"}
        </span>
        <span className="tabular font-display text-lg font-bold text-ink">
          {formatMoney(reservation.unitPrice * reservation.quantity)}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      {next && (
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => transition(next.status)}
            disabled={updating}
            className={`h-10 flex-1 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 ${next.className}`}
          >
            {updating ? "…" : next.label}
          </button>
          <button
            type="button"
            onClick={() => transition("cancelled")}
            disabled={updating}
            aria-label="Отменить бронь"
            title="Отменить бронь"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-60"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </article>
  );
}

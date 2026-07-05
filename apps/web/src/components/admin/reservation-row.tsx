"use client";

import { useState } from "react";
import { updateReservationStatus } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Reservation, ReservationStatus } from "@/lib/types";

const STATUS_STYLE: Record<ReservationStatus, string> = {
  new: "bg-brand-tint text-brand-strong",
  contacted: "bg-warn-tint text-warn",
  completed: "bg-save-tint text-save",
  cancelled: "bg-danger/10 text-danger",
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ReservationRow({
  reservation,
  onChanged,
}: {
  reservation: Reservation;
  onChanged: (updated: Reservation) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function transition(status: ReservationStatus) {
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateReservationStatus(reservation.id, status);
      onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update");
    } finally {
      setUpdating(false);
    }
  }

  const terminal =
    reservation.status === "completed" || reservation.status === "cancelled";

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">
          {reservation.studentName || "No name"}
        </div>
        <div className="text-xs text-muted">{reservation.studentContact}</div>
        {error && (
          <p role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-ink">
          {reservation.quantity} × {reservation.productName}
        </div>
        <div className="text-xs text-muted">
          {formatMoney(reservation.unitPrice * reservation.quantity)} ·{" "}
          {reservation.code}
        </div>
      </div>

      <div className="hidden text-right text-xs text-muted sm:block">
        {new Date(reservation.createdAt).toLocaleString()}
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[reservation.status]}`}
      >
        {STATUS_LABEL[reservation.status]}
      </span>

      {!terminal && (
        <div className="flex items-center gap-2">
          {reservation.status === "new" && (
            <button
              onClick={() => transition("contacted")}
              disabled={updating}
              className="rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Mark contacted
            </button>
          )}
          {reservation.status === "contacted" && (
            <button
              onClick={() => transition("completed")}
              disabled={updating}
              className="rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Mark completed
            </button>
          )}
          <button
            onClick={() => transition("cancelled")}
            disabled={updating}
            className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/5 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}

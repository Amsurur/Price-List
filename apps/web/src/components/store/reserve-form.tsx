"use client";

import { useState } from "react";
import { createReservation } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { AppliedCode } from "./code-unlock-strip";
import type { Product, Reservation } from "@/lib/types";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelClass = "block text-xs font-medium text-muted";

// On desktop this expands inline below the product card (following admin's
// generate-code-panel.tsx pattern). On mobile the card renders it inside a
// BottomSheet instead — `embedded` drops the form's own box chrome so it
// doesn't double up with the sheet's.
export function ReserveForm({
  product,
  appliedCode,
  onClose,
  embedded = false,
}: {
  product: Product;
  appliedCode: AppliedCode | null;
  onClose: () => void;
  embedded?: boolean;
}) {
  const [name, setName] = useState(appliedCode?.studentName ?? "");
  const [contact, setContact] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createReservation({
        code: appliedCode?.code,
        productId: product.id,
        studentName: name.trim() || undefined,
        studentContact: contact.trim(),
        quantity: Number(quantity) || 1,
        note: note.trim() || undefined,
      });
      setReservation(created);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось отправить бронирование — попробуйте ещё раз.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (reservation) {
    return (
      <div className="mt-3 rounded-xl bg-save-tint p-3">
        <p className="text-sm font-semibold text-save">
          Бронирование получено.
        </p>
        <p className="mt-1 text-sm text-save">
          Магазин свяжется с вами по {reservation.studentContact}, чтобы
          договориться о получении и оплате.
        </p>
        <p className="mt-2 text-xs text-save">
          {reservation.quantity} × {reservation.productName} —{" "}
          {formatMoney(reservation.unitPrice * reservation.quantity)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Забронировать ещё
        </button>
      </div>
    );
  }

  const unitPrice = product.memberPrice;
  const total = unitPrice * (Number(quantity) || 0);

  return (
    <form
      onSubmit={handleSubmit}
      className={
        embedded
          ? "flex flex-col gap-3"
          : "mt-3 flex flex-col gap-3 rounded-xl border border-line bg-bg p-3"
      }
    >
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <label className={labelClass}>Имя</label>
        <input
          className={`mt-1 ${inputClass}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Контакт (телефон или Telegram)</label>
        <input
          className={`mt-1 ${inputClass}`}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Количество</label>
          <input
            type="number"
            min={1}
            className={`mt-1 tabular ${inputClass}`}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Комментарий (необязательно)</label>
          <input
            className={`mt-1 ${inputClass}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        {product.name} × {quantity || 0} ·{" "}
        <span className="font-medium text-ink">{formatMoney(total)}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-brand px-4 py-2 font-display text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {submitting ? "Отправка…" : "Подтвердить бронирование"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

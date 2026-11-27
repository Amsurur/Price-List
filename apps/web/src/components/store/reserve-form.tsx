"use client";

import { useState } from "react";
import { createReservation } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { AppliedCode } from "@/lib/use-applied-code";
import type { Product, Reservation } from "@/lib/types";
import { CheckIcon } from "@/components/ui/icons";

const inputClass =
  "h-12 w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-brand";
const labelClass = "flex flex-col gap-1.5 text-sm font-semibold text-ink";

// The reservation form inside the reserve sheet. Prices shown here come from
// the API (product.memberPrice); the API re-prices the reservation itself.
export function ReserveForm({
  product,
  appliedCode,
  onClose,
}: {
  product: Product;
  appliedCode: AppliedCode | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(appliedCode?.studentName ?? "");
  const [contact, setContact] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const maxQty = Math.max(1, product.stock);

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
        quantity,
        note: note.trim() || undefined,
      });
      setReservation(created);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Бронь не отправилась. Проверьте интернет и попробуйте ещё раз.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (reservation) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-save text-white">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h3 className="font-display text-2xl font-bold text-ink">Товар забронирован</h3>
        <p className="max-w-xs text-sm text-ink-soft">
          Мы свяжемся с вами по {reservation.studentContact}, чтобы договориться о получении.
        </p>
        <div className="mt-2 w-full rounded-2xl bg-bg p-4 text-left text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-ink-soft">
              {reservation.quantity} × {reservation.productName}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-dashed border-line pt-2 font-semibold text-ink">
            <span>К оплате в магазине</span>
            <span className="tabular">{formatMoney(reservation.unitPrice * reservation.quantity)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 h-12 w-full rounded-full bg-ink font-display text-sm font-semibold text-surface"
        >
          Готово
        </button>
      </div>
    );
  }

  const discounted = product.saving > 0;
  const subtotal = product.price * quantity;
  const saving = product.saving * quantity;
  const total = product.memberPrice * quantity;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className={labelClass}>
        Ваше имя
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </label>
      <label className={labelClass}>
        Телефон или Telegram
        <input
          className={inputClass}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="+992 __ ___ __ __ или @username"
          autoComplete="tel"
          required
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">Количество</span>
        <div className="flex items-center gap-1 rounded-full bg-bg p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Меньше"
            className="h-9 w-9 rounded-full bg-surface text-lg font-semibold text-ink disabled:opacity-40"
          >
            −
          </button>
          <span className="tabular w-8 text-center font-semibold text-ink" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            aria-label="Больше"
            className="h-9 w-9 rounded-full bg-surface text-lg font-semibold text-ink disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <label className={labelClass}>
        <span>
          Комментарий <span className="font-normal text-muted">(необязательно)</span>
        </span>
        <input
          className={inputClass}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Например, удобное время"
        />
      </label>

      <div className="flex flex-col gap-2 rounded-2xl bg-bg p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Цена</span>
          <span className="tabular text-ink">{formatMoney(subtotal)}</span>
        </div>
        {discounted && (
          <div className="flex justify-between">
            <span className="text-muted">{appliedCode ? "Скидка по коду" : "Скидка"}</span>
            <span className="tabular text-save-strong">−{formatMoney(saving)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-dashed border-line pt-2 text-base font-bold text-ink">
          <span>К оплате в магазине</span>
          <span className="tabular">{formatMoney(total)}</span>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="h-14 rounded-full bg-brand font-display text-base font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Отправляем…" : "Подтвердить бронь"}
      </button>
      <p className="text-center text-xs text-muted">
        Онлайн-оплаты нет. Мы напишем, когда товар будет готов к выдаче.
      </p>
    </form>
  );
}

"use client";

import { useState } from "react";
import type { ValidateCodeResult } from "@/lib/types";

export interface AppliedCode {
  code: string;
  studentName: string | null;
}

export function CodeUnlockStrip({
  applied,
  onApply,
  onRemove,
}: {
  applied: AppliedCode | null;
  onApply: (code: string) => Promise<ValidateCodeResult>;
  onRemove: () => void;
}) {
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setChecking(true);
    setError(null);
    const result = await onApply(trimmed);
    setChecking(false);
    if (!result.ok) {
      setError(
        result.reason === "disabled"
          ? "Срок действия кода истёк."
          : "Код недействителен.",
      );
    } else {
      setInput("");
    }
  }

  if (applied) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand px-4 py-3">
        <p className="text-sm font-medium text-white">
          ✓ Код {applied.code} применён
          {applied.studentName ? ` — добро пожаловать, ${applied.studentName}` : ""}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Убрать ✕
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-brand-tint px-4 py-3">
      <p className="text-sm font-medium text-brand-strong">
        Студент Computerra? Введите код, чтобы открыть цену со скидкой.
      </p>
      <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="например, SOFT-7K2Q"
          aria-label="Код Computerra"
          className="w-full max-w-[220px] rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          disabled={checking || !input.trim()}
          className="rounded-xl bg-brand px-4 py-2 font-display text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {checking ? "Проверка…" : "Применить"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

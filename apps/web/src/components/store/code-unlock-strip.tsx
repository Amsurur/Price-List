"use client";

import { useState } from "react";
import type { ValidateCodeResult } from "@/lib/types";
import type { AppliedCode } from "@/lib/use-applied-code";
import { CheckIcon, KeyIcon } from "@/components/ui/icons";

export type { AppliedCode };

function errorText(reason: "empty" | "invalid" | "disabled"): string {
  return reason === "disabled" ? "Этот код отключён." : "Код не найден. Проверьте буквы и цифры.";
}

// The student-code entry. `band` is the dark full-width strip on the home
// page; `compact` sits inside the product page's price card.
export function CodeUnlockStrip({
  applied,
  onApply,
  onRemove,
  variant = "band",
}: {
  applied: AppliedCode | null;
  onApply: (code: string) => Promise<ValidateCodeResult>;
  onRemove: () => void;
  variant?: "band" | "compact";
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
    try {
      const result = await onApply(trimmed);
      if (!result.ok) setError(errorText(result.reason));
      else setInput("");
    } catch {
      setError("Не получилось проверить код. Попробуйте ещё раз.");
    } finally {
      setChecking(false);
    }
  }

  const compact = variant === "compact";

  if (applied) {
    return (
      <div
        className={`flex flex-wrap items-center gap-3 ${
          compact
            ? "rounded-2xl bg-save-tint px-4 py-3"
            : "rounded-3xl bg-save-tint px-5 py-4 sm:px-6"
        }`}
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-save text-white"
        >
          <CheckIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-save-strong">
            {applied.studentName ? `${applied.studentName}, цена участника включена` : "Цена участника включена"}
          </p>
          <p className="tabular text-xs text-save-strong/80">
            Код {applied.code}
            {applied.extraDiscount ? ` · ещё −${applied.extraDiscount}% к каждому товару` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full px-3 py-2 text-sm font-semibold text-save-strong underline-offset-4 hover:underline"
        >
          Убрать код
        </button>
      </div>
    );
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:w-auto">
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError(null);
        }}
        placeholder="SOFT-7K2Q"
        aria-label="Личный код студента"
        aria-invalid={error ? true : undefined}
        autoCapitalize="characters"
        className={`tabular h-12 min-w-0 flex-1 rounded-full px-5 text-[15px] font-semibold tracking-wider uppercase outline-none placeholder:font-normal placeholder:tracking-normal sm:w-56 sm:flex-none ${
          compact
            ? "border border-line bg-surface text-ink placeholder:text-muted focus:border-brand"
            : "border border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-white/50"
        }`}
      />
      <button
        type="submit"
        disabled={checking || !input.trim()}
        className="h-12 shrink-0 rounded-full bg-brand px-6 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {checking ? "Проверяем…" : "Применить"}
      </button>
    </form>
  );

  if (compact) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-brand-tint p-4">
        <p className="text-sm font-medium text-brand-strong">
          Есть код студента? Введите его и увидите цену со скидкой.
        </p>
        {form}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <section
      id="code"
      aria-label="Личный код студента"
      className="scroll-mt-32 rounded-3xl bg-night px-5 py-5 text-white sm:px-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10"
          >
            <KeyIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Личный код студента Softclub</p>
            <p className="text-sm text-white/60">Введите его, и цены на всех товарах станут ниже.</p>
          </div>
        </div>
        {form}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}

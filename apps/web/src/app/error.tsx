"use client";

import { Seal } from "@/components/seal";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <Seal />
      <h1 className="font-display text-2xl font-bold text-ink">
        Что-то пошло не так
      </h1>
      <p className="max-w-sm text-sm text-muted">
        Не удалось загрузить страницу. Попробуйте ещё раз — если это
        повторяется, зайдите позже.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Повторить
      </button>
    </div>
  );
}

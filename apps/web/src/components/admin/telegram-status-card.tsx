"use client";

import { useEffect, useState } from "react";
import { getTelegramStatus } from "@/lib/api";
import type { TelegramStatus } from "@/lib/types";

// Sidebar card: are new-reservation notifications reaching Telegram?
export function TelegramStatusCard() {
  const [status, setStatus] = useState<TelegramStatus | null | "error">(null);

  useEffect(() => {
    getTelegramStatus()
      .then(setStatus)
      .catch(() => setStatus("error"));
  }, []);

  if (status === null) return <div className="h-[68px] animate-pulse rounded-2xl bg-bg" />;

  const ok = status !== "error" && status.configured;
  return (
    <div className={`rounded-2xl p-3 ${ok ? "bg-save-tint" : "bg-warn-tint"}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${ok ? "bg-save" : "bg-warn"}`} />
        Telegram
      </div>
      <p className="mt-0.5 text-xs text-ink-soft">
        {status === "error"
          ? "Не удалось проверить."
          : ok
            ? `Уведомления о бронях приходят в ${status.chats} ${status.chats === 1 ? "чат" : "чата"}.`
            : "Уведомления не настроены: нужны TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID на сервере."}
      </p>
    </div>
  );
}

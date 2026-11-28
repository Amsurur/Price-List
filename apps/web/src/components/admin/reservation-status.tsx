import type { ReservationStatus } from "@/lib/types";

export const STATUS_STYLE: Record<ReservationStatus, string> = {
  new: "bg-brand-tint text-brand-strong",
  contacted: "bg-warn-tint text-warn",
  ready: "bg-save text-white",
  completed: "bg-save-tint text-save-strong",
  cancelled: "bg-danger/10 text-danger",
};

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  new: "Новая",
  contacted: "Связались",
  ready: "Готова к выдаче",
  completed: "Выдано",
  cancelled: "Отменено",
};

export function StatusPill({ status }: { status: ReservationStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// "14:20" today, "вчера", otherwise "25 ноя".
export function shortWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = d.getTime();
  if (t >= startOfToday) return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  if (t >= startOfToday - 86_400_000) return "вчера";
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" }).replace(".", "");
}

"use client";

import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";
import type { ShopSettings } from "@/lib/types";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink";
const hintClass = "text-xs font-normal text-muted";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready" };

// The shop's public details. Shown in the storefront footer, on product pages
// (Telegram button, pickup info) and after a reservation.
export default function SettingsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [form, setForm] = useState({
    address: "",
    phone: "",
    telegram: "",
    hours: "",
    holdDays: "3",
    mapUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fill(s: ShopSettings) {
    setForm({
      address: s.address ?? "",
      phone: s.phone ?? "",
      telegram: s.telegram ?? "",
      hours: s.hours ?? "",
      holdDays: String(s.holdDays),
      mapUrl: s.mapUrl ?? "",
    });
  }

  function load() {
    getSettings()
      .then((s) => {
        fill(s);
        setState({ kind: "ready" });
      })
      .catch((err: unknown) =>
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Не удалось загрузить настройки",
        }),
      );
  }

  useEffect(load, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSettings({
        address: form.address,
        phone: form.phone,
        telegram: form.telegram,
        hours: form.hours,
        holdDays: Number(form.holdDays) || 3,
        mapUrl: form.mapUrl,
      });
      fill(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Настройки магазина</h1>
        <p className="mt-1 text-sm text-muted">
          Эти данные видят студенты: в подвале сайта, на странице товара и после брони.
        </p>
      </div>

      {state.kind === "loading" && <div className="h-96 animate-pulse rounded-3xl bg-surface" />}

      {state.kind === "error" && (
        <div className="rounded-3xl border border-danger/30 bg-danger/5 px-4 py-8 text-center">
          <p className="text-sm text-danger">{state.message}</p>
          <button
            onClick={() => {
              setState({ kind: "loading" });
              load();
            }}
            className="mt-3 h-10 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink"
          >
            Повторить
          </button>
        </div>
      )}

      {state.kind === "ready" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <label className={labelClass}>
            Адрес магазина
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="г. Душанбе, ул. …, д. …"
              maxLength={300}
            />
          </label>
          <label className={labelClass}>
            <span>
              Ссылка на карту <span className={hintClass}>(необязательно, 2GIS или Google Maps)</span>
            </span>
            <input
              className={inputClass}
              value={form.mapUrl}
              onChange={(e) => set("mapUrl", e.target.value)}
              placeholder="https://2gis.tj/…"
              inputMode="url"
              maxLength={500}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Телефон
              <input
                className={`tabular ${inputClass}`}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+992 __ ___ __ __"
                inputMode="tel"
                maxLength={50}
              />
            </label>
            <label className={labelClass}>
              <span>
                Telegram <span className={hintClass}>(имя без @)</span>
              </span>
              <input
                className={inputClass}
                value={form.telegram}
                onChange={(e) => set("telegram", e.target.value)}
                placeholder="computerra_tj"
                maxLength={33}
              />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
            <label className={labelClass}>
              Часы работы
              <input
                className={inputClass}
                value={form.hours}
                onChange={(e) => set("hours", e.target.value)}
                placeholder="Пн–Сб 10:00–19:00"
                maxLength={200}
              />
            </label>
            <label className={labelClass}>
              Бронь держим, дней
              <input
                type="number"
                min={1}
                max={30}
                className={`tabular ${inputClass}`}
                value={form.holdDays}
                onChange={(e) => set("holdDays", e.target.value)}
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="rounded-[10px] bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-full bg-brand px-6 font-display text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
            >
              {saving ? "Сохраняем…" : "Сохранить"}
            </button>
            {saved && (
              <span role="status" className="text-sm font-medium text-save-strong">
                Сохранено
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

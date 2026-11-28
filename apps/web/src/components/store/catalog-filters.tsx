"use client";

import type { Product } from "@/lib/types";

export interface Filters {
  min: string;
  max: string;
  inStock: boolean;
  colors: string[];
  configs: string[];
}

export const NO_FILTERS: Filters = { min: "", max: "", inStock: false, colors: [], configs: [] };

export function activeFilterCount(f: Filters): number {
  return (
    (f.min ? 1 : 0) + (f.max ? 1 : 0) + (f.inStock ? 1 : 0) + f.colors.length + f.configs.length
  );
}

// Applies the panel's filters. Price compares the API's member price of the
// default pick, i.e. the price on the card.
export function matchesFilters(p: Product, f: Filters): boolean {
  const min = Number(f.min);
  const max = Number(f.max);
  if (f.min && p.memberPrice < min) return false;
  if (f.max && p.memberPrice > max) return false;
  if (f.inStock && p.stock <= 0) return false;
  if (f.colors.length && !p.colors.some((c) => f.colors.includes(c.name))) return false;
  if (f.configs.length && !p.configs.some((c) => f.configs.includes(c.label))) return false;
  return true;
}

// Colour and configuration choices offered by the products in view.
export function filterOptions(products: Product[]) {
  const colors = new Map<string, string>();
  const configs = new Set<string>();
  for (const p of products) {
    p.colors.forEach((c) => colors.has(c.name) || colors.set(c.name, c.hex));
    p.configs.forEach((c) => configs.add(c.label));
  }
  return {
    colors: [...colors.entries()].map(([name, hex]) => ({ name, hex })),
    configs: [...configs].sort((a, b) => a.localeCompare(b, "ru", { numeric: true })),
  };
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const inputClass =
  "tabular h-11 w-full min-w-0 rounded-2xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand";

// The filter controls. Rendered as a sidebar on desktop and inside a bottom
// sheet on phones (see the home page).
export function CatalogFilters({
  products,
  value,
  onChange,
}: {
  products: Product[];
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  const options = filterOptions(products);
  const prices = products.map((p) => p.memberPrice);
  const lo = prices.length ? Math.min(...prices) : 0;
  const hi = prices.length ? Math.max(...prices) : 0;

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-ink">Цена, c</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label="Цена от"
            placeholder={lo.toLocaleString("ru")}
            className={inputClass}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label="Цена до"
            placeholder={hi.toLocaleString("ru")}
            className={inputClass}
            value={value.max}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
          />
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink">
        Только в наличии
        <input
          type="checkbox"
          checked={value.inStock}
          onChange={(e) => onChange({ ...value, inStock: e.target.checked })}
          className="h-5 w-5 accent-brand"
        />
      </label>

      {options.colors.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Цвет</legend>
          <div className="flex flex-wrap gap-2">
            {options.colors.map((c) => {
              const on = value.colors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...value, colors: toggle(value.colors, c.name) })}
                  className={`flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors ${
                    on ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink-soft hover:text-ink"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full border border-line"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {options.configs.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Память и конфигурация</legend>
          <div className="flex flex-wrap gap-2">
            {options.configs.map((label) => {
              const on = value.configs.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...value, configs: toggle(value.configs, label) })}
                  className={`h-9 rounded-full border px-3 text-sm transition-colors ${
                    on ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink-soft hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {activeFilterCount(value) > 0 && (
        <button
          type="button"
          onClick={() => onChange(NO_FILTERS)}
          className="h-10 rounded-full border border-line text-sm font-semibold text-ink hover:bg-bg"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}

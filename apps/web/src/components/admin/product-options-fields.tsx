"use client";

import Image from "next/image";
import { imageSrc } from "@/lib/api";
import type { ProductColor, ProductConfig, ProductSpec } from "@/lib/types";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const smallButton =
  "rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-bg";
const removeButton =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-muted hover:bg-danger/10 hover:text-danger";

function Section({
  title,
  hint,
  children,
  action,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-line bg-surface p-4">
      <legend className="sr-only">{title}</legend>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </fieldset>
  );
}

function update<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

const toInt = (v: string) => Math.max(0, Math.round(Number(v) || 0));

export function ColorsField({
  colors,
  images,
  onChange,
}: {
  colors: ProductColor[];
  images: string[];
  onChange: (next: ProductColor[]) => void;
}) {
  return (
    <Section
      title="Цвета"
      hint="Первый цвет выбран по умолчанию. Доплата добавляется к цене. Остаток пустой — общий на товар."
      action={
        <button
          type="button"
          className={smallButton}
          onClick={() => onChange([...colors, { name: "", hex: "#C9CCD3", extraPrice: 0, images: [] }])}
        >
          + Цвет
        </button>
      }
    >
      {colors.length === 0 && <p className="text-sm text-muted">Без выбора цвета.</p>}
      {colors.map((c, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl bg-bg p-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Цвет
              <input
                type="color"
                value={c.hex}
                onChange={(e) => onChange(update(colors, i, { hex: e.target.value.toUpperCase() }))}
                className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1"
              />
            </label>
            <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs font-medium text-muted">
              Название
              <input
                className={inputClass}
                value={c.name}
                onChange={(e) => onChange(update(colors, i, { name: e.target.value }))}
                placeholder="например, Серебристый"
                required
                maxLength={60}
              />
            </label>
            <label className="flex w-32 flex-col gap-1 text-xs font-medium text-muted">
              Доплата
              <input
                type="number"
                min={0}
                inputMode="numeric"
                className={`tabular ${inputClass}`}
                value={c.extraPrice}
                onChange={(e) => onChange(update(colors, i, { extraPrice: toInt(e.target.value) }))}
              />
            </label>
            <label className="flex w-28 flex-col gap-1 text-xs font-medium text-muted">
              Остаток
              <input
                type="number"
                min={0}
                inputMode="numeric"
                className={`tabular ${inputClass}`}
                value={c.stock ?? ""}
                placeholder="общий"
                title="Пусто — используется общий остаток товара"
                onChange={(e) =>
                  onChange(
                    update(colors, i, {
                      stock: e.target.value === "" ? null : toInt(e.target.value),
                    }),
                  )
                }
              />
            </label>
            <button
              type="button"
              aria-label={`Удалить цвет ${c.name}`}
              className={removeButton}
              onClick={() => onChange(colors.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
          {images.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted">Фото этого цвета (нажмите, чтобы выбрать):</p>
              <div className="flex flex-wrap gap-2">
                {images.map((url) => {
                  const on = c.images.includes(url);
                  const src = imageSrc(url);
                  return (
                    <button
                      key={url}
                      type="button"
                      aria-pressed={on}
                      aria-label={on ? "Убрать фото из цвета" : "Добавить фото к цвету"}
                      onClick={() =>
                        onChange(
                          update(colors, i, {
                            images: on ? c.images.filter((u) => u !== url) : [...c.images, url],
                          }),
                        )
                      }
                      className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 bg-surface ${
                        on ? "border-brand" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      {src && <Image src={src} alt="" fill unoptimized sizes="56px" className="object-cover" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </Section>
  );
}

export function ConfigsField({
  configs,
  onChange,
}: {
  configs: ProductConfig[];
  onChange: (next: ProductConfig[]) => void;
}) {
  return (
    <Section
      title="Конфигурации"
      hint="Например, объём памяти. Первая выбрана по умолчанию."
      action={
        <button
          type="button"
          className={smallButton}
          onClick={() => onChange([...configs, { label: "", extraPrice: 0 }])}
        >
          + Конфигурация
        </button>
      }
    >
      {configs.length === 0 && <p className="text-sm text-muted">Одна конфигурация.</p>}
      {configs.map((c, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs font-medium text-muted">
            Название
            <input
              className={inputClass}
              value={c.label}
              onChange={(e) => onChange(update(configs, i, { label: e.target.value }))}
              placeholder="например, 16 ГБ / 512 ГБ"
              required
              maxLength={80}
            />
          </label>
          <label className="flex w-32 flex-col gap-1 text-xs font-medium text-muted">
            Доплата
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className={`tabular ${inputClass}`}
              value={c.extraPrice}
              onChange={(e) => onChange(update(configs, i, { extraPrice: toInt(e.target.value) }))}
            />
          </label>
          <button
            type="button"
            aria-label={`Удалить конфигурацию ${c.label}`}
            className={removeButton}
            onClick={() => onChange(configs.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
    </Section>
  );
}

const SPEC_TEMPLATES: Record<string, string[]> = {
  Ноутбук: ["Процессор", "Оперативная память", "Накопитель", "Экран", "Видеокарта", "Вес", "Батарея"],
  Монитор: ["Диагональ", "Разрешение", "Матрица", "Частота", "Разъёмы"],
  Аксессуар: ["Подключение", "Совместимость", "Цвет"],
};

export function SpecsField({
  specs,
  onChange,
}: {
  specs: ProductSpec[];
  onChange: (next: ProductSpec[]) => void;
}) {
  function applyTemplate(labels: string[]) {
    const existing = new Set(specs.map((s) => s.label));
    onChange([...specs, ...labels.filter((l) => !existing.has(l)).map((label) => ({ label, value: "" }))]);
  }

  return (
    <Section
      title="Характеристики"
      hint="Показываются таблицей на странице товара. Пустые строки не сохраняются."
      action={
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SPEC_TEMPLATES).map(([name, labels]) => (
            <button key={name} type="button" className={smallButton} onClick={() => applyTemplate(labels)}>
              {name}
            </button>
          ))}
          <button
            type="button"
            className={smallButton}
            onClick={() => onChange([...specs, { label: "", value: "" }])}
          >
            + Строка
          </button>
        </div>
      }
    >
      {specs.length === 0 && <p className="text-sm text-muted">Нажмите шаблон, чтобы добавить типовые строки.</p>}
      {specs.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            aria-label="Характеристика"
            className={`${inputClass} max-w-[40%]`}
            value={s.label}
            onChange={(e) => onChange(update(specs, i, { label: e.target.value }))}
            placeholder="Экран"
            maxLength={80}
          />
          <input
            aria-label="Значение"
            className={inputClass}
            value={s.value}
            onChange={(e) => onChange(update(specs, i, { value: e.target.value }))}
            placeholder="13.6″ Liquid Retina"
            maxLength={300}
          />
          <button
            type="button"
            aria-label={`Удалить строку ${s.label}`}
            className={removeButton}
            onClick={() => onChange(specs.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
    </Section>
  );
}

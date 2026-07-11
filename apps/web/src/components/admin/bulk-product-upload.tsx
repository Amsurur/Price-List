"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createProductsBulk, imageSrc, uploadProductImage } from "@/lib/api";
import { downloadProductsTemplate, parseProductsFile } from "@/lib/bulk-parse";
import { formatMoney } from "@/lib/format";
import type { BulkCreateResult, ProductInput } from "@/lib/types";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelClass = "block text-sm font-medium text-ink";

interface ReviewRow {
  id: string;
  data: ProductInput;
  expanded: boolean;
  uploadingImage: boolean;
  result?: BulkCreateResult;
}

// Client-side mirror of CreateProductDto's rules (apps/api create-product.dto.ts)
// — a heads-up for the admin before saving. The API remains the real gatekeeper.
function rowIssues(data: ProductInput): string[] {
  const issues: string[] = [];
  if (!data.name.trim()) issues.push("Укажите название");
  else if (data.name.length > 200) issues.push("Название длиннее 200 символов");
  if (!Number.isFinite(data.price) || data.price < 0) {
    issues.push("Цена должна быть числом от 0");
  }
  if (
    data.memberDiscount !== undefined &&
    (data.memberDiscount < 0 || data.memberDiscount > 90)
  ) {
    issues.push("Скидка — от 0 до 90%");
  }
  if (data.stock !== undefined && data.stock < 0) {
    issues.push("Остаток не может быть отрицательным");
  }
  return issues;
}

// Mirrors apps/api/src/common/pricing.ts for the live preview only.
function previewMemberPrice(price: number, discount: number): number {
  const clamped = Math.min(90, Math.max(0, Math.round(discount) || 0));
  return Math.round(price * (1 - clamped / 100));
}

export function BulkProductUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<{ created: number; total: number } | null>(null);

  async function handleFile(file: File) {
    setParseError(null);
    setSummary(null);
    setParsing(true);
    try {
      const parsed = await parseProductsFile(file);
      setRows(
        parsed.map((row) => ({
          id: row.id,
          data: row.data,
          expanded: true,
          uploadingImage: false,
        })),
      );
    } catch (err) {
      setRows([]);
      setParseError(err instanceof Error ? err.message : "Не удалось прочитать файл");
    } finally {
      setParsing(false);
    }
  }

  function updateRow(id: string, patch: Partial<ProductInput>) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, data: { ...row.data, ...patch }, result: undefined }
          : row,
      ),
    );
  }

  function toggleRow(id: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, expanded: !row.expanded } : row)),
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  async function handleRowImages(id: string, files: File[]) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, uploadingImage: true } : row)),
    );
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadProductImage(file));
      }
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                data: { ...row.data, images: [...(row.data.images ?? []), ...uploaded] },
                uploadingImage: false,
              }
            : row,
        ),
      );
    } catch {
      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, uploadingImage: false } : row)),
      );
    }
  }

  function removeRowImage(id: string, index: number) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              data: {
                ...row.data,
                images: (row.data.images ?? []).filter((_, i) => i !== index),
              },
            }
          : row,
      ),
    );
  }

  async function handleSaveAll() {
    // Skip rows that already saved successfully — a retry after fixing
    // errors should only resubmit the rows that still need it.
    const pending = rows.filter((row) => row.result?.status !== "created");
    if (pending.length === 0) return;
    setSaving(true);
    try {
      const results = await createProductsBulk(pending.map((row) => row.data));
      const rowIdByIndex = new Map(pending.map((row, i) => [i, row.id]));
      const resultByRowId = new Map<string, BulkCreateResult>();
      results.forEach((result) => {
        const rowId = rowIdByIndex.get(result.index);
        if (rowId) resultByRowId.set(rowId, result);
      });
      const alreadyCreated = rows.filter((row) => row.result?.status === "created").length;
      setRows((prev) =>
        prev.map((row) => {
          const result = resultByRowId.get(row.id);
          if (!result) return row;
          return { ...row, result, expanded: result.status === "error" ? true : row.expanded };
        }),
      );
      const created = results.filter((r) => r.status === "created").length;
      setSummary({ created: created + alreadyCreated, total: rows.length });
      router.refresh();
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Не удалось сохранить товары");
    } finally {
      setSaving(false);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="text-sm text-ink">
            Загрузите файл со списком товаров — .xlsx, .csv или .json.
          </p>
          <p className="mt-1 text-xs text-muted">
            Для .xlsx и .csv используйте столбцы из шаблона ниже.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Выбрать файл
            </button>
            <button
              type="button"
              onClick={() => downloadProductsTemplate()}
              className="rounded-xl border border-line px-4 py-2.5 font-display text-sm font-semibold text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Скачать шаблон
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          {parsing && <p className="mt-3 text-xs text-muted">Читаем файл…</p>}
        </div>
        {parseError && (
          <p
            role="alert"
            className="mt-4 rounded-[10px] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            {parseError}
          </p>
        )}
      </div>
    );
  }

  const pendingCount = rows.filter((row) => row.result?.status !== "created").length;

  return (
    <div className="max-w-2xl">
      {parseError && (
        <p
          role="alert"
          className="mb-4 rounded-[10px] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {parseError}
        </p>
      )}

      {summary && (
        <p
          className={`mb-4 rounded-[10px] border px-3 py-2 text-sm text-ink ${
            summary.created === summary.total
              ? "border-save/30 bg-save-tint"
              : "border-warn/30 bg-warn-tint"
          }`}
        >
          Создано {summary.created} из {summary.total}.
          {summary.created < summary.total && " Исправьте ошибки ниже и повторите."}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <BulkRow
            key={row.id}
            row={row}
            onToggle={() => toggleRow(row.id)}
            onChange={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
            onAddImages={(files) => handleRowImages(row.id, files)}
            onRemoveImage={(index) => removeRowImage(row.id, index)}
          />
        ))}
      </ul>

      <div className="sticky bottom-0 -mx-6 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-surface px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving || pendingCount === 0}
          className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {saving
            ? "Сохранение…"
            : summary
              ? `Повторить (${pendingCount})`
              : `Сохранить все (${rows.length})`}
        </button>
        <button
          type="button"
          onClick={() => {
            setRows([]);
            setSummary(null);
            setParseError(null);
          }}
          className="rounded-xl border border-line px-4 py-2.5 font-display text-sm font-semibold text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Начать заново
        </button>
      </div>
    </div>
  );
}

function BulkRow({
  row,
  onToggle,
  onChange,
  onRemove,
  onAddImages,
  onRemoveImage,
}: {
  row: ReviewRow;
  onToggle: () => void;
  onChange: (patch: Partial<ProductInput>) => void;
  onRemove: () => void;
  onAddImages: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
}) {
  const { data, result } = row;
  const issues = rowIssues(data);
  const created = result?.status === "created";

  return (
    <li className="rounded-xl border border-line bg-surface">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-expanded={row.expanded}
        >
          <span className={`inline-block transition-transform ${row.expanded ? "rotate-90" : ""}`} aria-hidden>
            ›
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display font-semibold text-ink">
              {data.name || "Без названия"}
            </span>
            <span className="text-xs text-muted">
              {data.price ? formatMoney(data.price) : "Цена не указана"}
            </span>
          </span>
          {created ? (
            <span className="rounded-full bg-save-tint px-2 py-0.5 text-[11px] font-medium text-ink">
              Создан
            </span>
          ) : result?.status === "error" ? (
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
              Ошибка
            </span>
          ) : issues.length > 0 ? (
            <span className="rounded-full bg-warn-tint px-2 py-0.5 text-[11px] font-medium text-ink">
              Проверьте
            </span>
          ) : null}
        </button>
        {!created && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Убрать из списка"
            className="flex h-8 w-8 items-center justify-center rounded text-sm text-danger hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            ×
          </button>
        )}
      </div>

      {row.expanded && !created && (
        <div className="grid gap-4 border-t border-line p-4">
          {result?.status === "error" && result.error && (
            <p
              role="alert"
              className="rounded-[10px] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {result.error}
            </p>
          )}

          <div>
            <label className={labelClass}>Название</label>
            <input
              className={`mt-1 ${inputClass}`}
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              maxLength={200}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Категория</label>
              <input
                className={`mt-1 ${inputClass}`}
                value={data.category ?? ""}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Теги</label>
              <input
                className={`mt-1 ${inputClass}`}
                value={(data.tags ?? []).join(", ")}
                onChange={(e) =>
                  onChange({
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim().toLowerCase())
                      .filter(Boolean),
                  })
                }
                placeholder="через запятую"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Цена</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className={`mt-1 tabular ${inputClass}`}
                value={data.price}
                onChange={(e) => onChange({ price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>Скидка, %</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={90}
                className={`mt-1 tabular ${inputClass}`}
                value={data.memberDiscount ?? 15}
                onChange={(e) => onChange({ memberDiscount: Number(e.target.value) })}
              />
              {data.price > 0 && (
                <p className="mt-1 text-xs text-muted">
                  Студент увидит:{" "}
                  {formatMoney(previewMemberPrice(data.price, data.memberDiscount ?? 15))}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Остаток</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className={`mt-1 tabular ${inputClass}`}
                value={data.stock ?? 0}
                onChange={(e) => onChange({ stock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <span className={labelClass}>Фото</span>
            {(data.images ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-3">
                {(data.images ?? []).map((url, index) => {
                  const preview = imageSrc(url);
                  return (
                    <div
                      key={url + index}
                      className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-brand-tint"
                    >
                      {preview && (
                        <Image
                          src={preview}
                          alt=""
                          width={64}
                          height={64}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveImage(index)}
                        aria-label="Удалить фото"
                        className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-bl bg-surface text-xs text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-2 text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-tint file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-strong"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length > 0) onAddImages(files);
                e.target.value = "";
              }}
            />
            {row.uploadingImage && (
              <span className="mt-1 block text-xs text-muted">Загрузка…</span>
            )}
          </div>

          <div>
            <label className={labelClass}>Описание</label>
            <textarea
              rows={2}
              className={`mt-1 ${inputClass}`}
              value={data.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={data.active ?? true}
              onChange={(e) => onChange({ active: e.target.checked })}
              className="h-4 w-4 accent-brand"
            />
            Активен (виден в магазине)
          </label>

          {issues.length > 0 && (
            <ul className="text-xs text-warn">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

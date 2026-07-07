"use client";

import { useState } from "react";

// A single discount-percent field that saves itself on blur/Enter. Shared by
// the Discounts screen for both product member-discount and code
// discount-override, so the two edit surfaces can't drift apart.
export function InlineDiscountEditor({
  value,
  allowNull = false,
  onSave,
}: {
  value: number | null;
  allowNull?: boolean;
  onSave: (value: number | null) => Promise<void>;
}) {
  const [text, setText] = useState(value != null ? String(value) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setText(value != null ? String(value) : "");
  }

  async function commit() {
    const trimmed = text.trim();

    if (trimmed === "") {
      if (!allowNull) {
        reset();
        return;
      }
      if (value === null) return;
      await save(null);
      return;
    }

    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 0 || num > 90) {
      setError("Whole number 0–90");
      reset();
      return;
    }
    if (num === value) return;
    await save(num);
  }

  async function save(next: number | null) {
    setSaving(true);
    setError(null);
    try {
      await onSave(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={90}
        inputMode="numeric"
        value={text}
        placeholder={allowNull ? "Standard" : undefined}
        onChange={(e) => {
          setError(null);
          setText(e.target.value);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        disabled={saving}
        aria-label="Discount percent"
        className="w-20 rounded-[10px] border border-line bg-surface px-2 py-1.5 text-sm tabular text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
      />
      <span className="text-sm text-muted">%</span>
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}

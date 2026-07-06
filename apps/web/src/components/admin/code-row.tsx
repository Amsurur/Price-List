"use client";

import { useState } from "react";
import { deleteStudentCode, updateStudentCode } from "@/lib/api";
import type { StudentCode } from "@/lib/types";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export function CodeRow({
  code,
  onChanged,
  onDeleted,
}: {
  code: StudentCode;
  onChanged: (updated: StudentCode) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentName, setStudentName] = useState(code.studentName ?? "");
  const [discountOverride, setDiscountOverride] = useState(
    code.discountOverride != null ? String(code.discountOverride) : "",
  );
  const [note, setNote] = useState(code.note ?? "");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions); the code is still visible to copy by hand.
    }
  }

  async function handleToggleActive() {
    const previous = code.active;
    onChanged({ ...code, active: !previous });
    try {
      const updated = await updateStudentCode(code.id, { active: !previous });
      onChanged(updated);
    } catch {
      onChanged({ ...code, active: previous });
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateStudentCode(code.id, {
        studentName: studentName.trim() || undefined,
        discountOverride:
          discountOverride.trim() === "" ? null : Number(discountOverride),
        note: note.trim() || undefined,
      });
      onChanged(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    onDeleted(code.id);
    try {
      await deleteStudentCode(code.id);
    } catch {
      // Best-effort; a stale row is a minor issue and the list can be refreshed.
    }
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-line bg-surface p-4">
        {error && (
          <p role="alert" className="mb-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-muted">
              Student name
            </label>
            <input
              className={`mt-1 ${inputClass}`}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">
              Discount override % (blank = standard)
            </label>
            <input
              type="number"
              min={0}
              max={90}
              className={`mt-1 tabular ${inputClass}`}
              value={discountOverride}
              onChange={(e) => setDiscountOverride(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">
              Note
            </label>
            <input
              className={`mt-1 ${inputClass}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-3">
      <button
        onClick={handleCopy}
        title="Copy code"
        className="rounded-full bg-brand-tint px-3 py-1.5 font-display text-sm font-semibold text-brand-strong hover:bg-brand/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {copied ? "Copied!" : code.code}
      </button>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">
          {code.studentName || "No name"}
        </div>
        <div className="text-xs text-muted">
          {code.discountOverride != null
            ? `${code.discountOverride}% override`
            : "Standard discount"}
          {code.note ? ` · ${code.note}` : ""}
        </div>
      </div>

      <div className="hidden text-right text-xs text-muted sm:block">
        <div>{code.usesCount} uses</div>
        <div>
          {code.lastUsedAt
            ? `Last used ${new Date(code.lastUsedAt).toLocaleDateString()}`
            : "Never used"}
        </div>
      </div>

      <button
        onClick={handleToggleActive}
        className={`rounded-full px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          code.active
            ? "bg-save-tint text-save"
            : "bg-danger/10 text-danger"
        }`}
      >
        {code.active ? "Active" : "Disabled"}
      </button>

      <div className="flex items-center gap-2">
        {confirming ? (
          <>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-danger px-3 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Keep
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-danger hover:bg-danger/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

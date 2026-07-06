"use client";

import { useState } from "react";
import { createStudentCode, createStudentCodeBatch } from "@/lib/api";
import type { StudentCode } from "@/lib/types";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelClass = "block text-sm font-medium text-ink";

type Mode = "single" | "batch";

export function GenerateCodePanel({
  onGenerated,
}: {
  onGenerated: (codes: StudentCode[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("single");

  const [studentName, setStudentName] = useState("");
  const [discountOverride, setDiscountOverride] = useState("");
  const [note, setNote] = useState("");
  const [count, setCount] = useState("10");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState<StudentCode[]>([]);

  function reset() {
    setStudentName("");
    setDiscountOverride("");
    setNote("");
    setCount("10");
    setError(null);
    setJustGenerated([]);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setJustGenerated([]);
    try {
      if (mode === "single") {
        const created = await createStudentCode({
          studentName: studentName.trim() || undefined,
          discountOverride:
            discountOverride.trim() === "" ? undefined : Number(discountOverride),
          note: note.trim() || undefined,
        });
        setJustGenerated([created]);
        onGenerated([created]);
      } else {
        const created = await createStudentCodeBatch({
          count: Number(count),
          discountOverride:
            discountOverride.trim() === "" ? undefined : Number(discountOverride),
          note: note.trim() || undefined,
        });
        setJustGenerated(created);
        onGenerated(created);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate code",
      );
    } finally {
      setGenerating(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setMode("single");
            setOpen(true);
            reset();
          }}
          className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Generate code
        </button>
        <button
          onClick={() => {
            setMode("batch");
            setOpen(true);
            reset();
          }}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 font-display text-sm font-semibold text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Generate batch
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">
          {mode === "single" ? "Generate a code" : "Generate a batch"}
        </h2>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Close
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {justGenerated.length > 0 ? (
        <div className="mt-3 rounded-lg bg-save-tint p-3">
          <p className="text-sm font-medium text-save">
            {justGenerated.length === 1
              ? "Code generated:"
              : `${justGenerated.length} codes generated:`}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {justGenerated.map((c) => (
              <CopyPill key={c.id} code={c.code} />
            ))}
          </ul>
          <button
            onClick={() => {
              setJustGenerated([]);
              reset();
            }}
            className="mt-3 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Generate another
          </button>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="mt-3 grid gap-3">
          {mode === "single" ? (
            <div>
              <label className={labelClass}>Student name (optional)</label>
              <input
                className={`mt-1 ${inputClass}`}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={labelClass}>How many?</label>
              <input
                type="number"
                min={1}
                max={200}
                className={`mt-1 tabular ${inputClass}`}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Discount override % (optional)
              </label>
              <input
                type="number"
                min={0}
                max={90}
                className={`mt-1 tabular ${inputClass}`}
                value={discountOverride}
                onChange={(e) => setDiscountOverride(e.target.value)}
                placeholder="Leave blank for standard"
              />
            </div>
            <div>
              <label className={labelClass}>Note (optional)</label>
              <input
                className={`mt-1 ${inputClass}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={generating}
              className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {generating ? "Generating…" : "Generate"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function CopyPill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions); the code is still visible to copy by hand.
    }
  }

  return (
    <li>
      <button
        onClick={handleCopy}
        className="rounded-full bg-surface px-3 py-1.5 font-display text-sm font-semibold text-save shadow-sm hover:bg-brand-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {copied ? "Copied!" : code}
      </button>
    </li>
  );
}

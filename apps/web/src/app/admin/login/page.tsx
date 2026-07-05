"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Seal } from "@/components/seal";
import { login } from "@/lib/auth";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelClass = "block text-sm font-medium text-ink";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Seal />
          <h1 className="font-display text-xl font-bold text-ink">
            Computerra admin
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border border-line bg-surface p-6"
        >
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-[10px] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <div className="grid gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className={`mt-1 ${inputClass}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`mt-1 ${inputClass}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

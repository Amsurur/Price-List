import { HealthStatus } from "@/components/health-status";
import { Seal } from "@/components/seal";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Sticky top bar with brand + seal (design system: quiet, brand carries it). */}
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-3 px-6">
          <Seal />
          <span className="font-display text-lg font-semibold text-ink">
            Softclub Store
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-start gap-8 px-6 py-16">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-brand-strong">
            Milestone 0 · project setup
          </p>
          <h1 className="font-display text-3xl font-bold text-ink">
            The blank, styled app is live.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Next.js frontend and NestJS API are wired together. Design tokens
            from the spec are applied. The storefront and admin come next,
            milestone by milestone.
          </p>
        </div>

        <HealthStatus />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Primary action
          </button>
          <span className="rounded-full bg-brand-tint px-3 py-1 text-sm font-medium text-brand-strong">
            Softclub −15%
          </span>
          <span className="rounded-full bg-save-tint px-3 py-1 text-sm font-medium text-save">
            Save $120
          </span>
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Softclub Store · reserve online, pick up at the shop
      </footer>
    </div>
  );
}

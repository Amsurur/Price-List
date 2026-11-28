import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
import { AdminNav } from "@/components/admin/admin-nav";
import { TelegramStatusCard } from "@/components/admin/telegram-status-card";
import { LogoutButton } from "@/components/admin/logout-button";
import { Seal } from "@/components/seal";

// Admin shell: a sidebar on desktop, a top bar with scrolling tabs on phones.
// AdminAuthGuard redirects to /admin/login when the session check fails; the
// JwtAuthGuard on the API enforces it on every actual request regardless.
// `admin-light` keeps the panel light even if the storefront is in dark mode.
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-light flex min-h-screen flex-col bg-bg text-ink lg:flex-row">
      <aside className="sticky top-0 z-20 flex flex-col gap-3 border-b border-line bg-surface/95 px-3 py-3 backdrop-blur lg:h-screen lg:w-64 lg:shrink-0 lg:gap-6 lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:px-2">
          <Link href="/admin" className="flex items-center gap-2.5 rounded-full">
            <Seal />
            <span>
              <span className="block font-display text-base leading-tight font-bold text-ink">
                Computerra<span className="text-brand">.store</span>
              </span>
              <span className="block text-xs text-muted">Админ-панель</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/" className="text-sm font-medium text-brand-strong">
              В магазин
            </Link>
            <LogoutButton />
          </div>
        </div>

        <AdminNav />

        <div className="mt-auto hidden flex-col gap-3 lg:flex">
          <TelegramStatusCard />
        </div>

        <div className="hidden flex-col gap-2 border-t border-line pt-4 lg:flex lg:px-2">
          <Link href="/" className="text-sm font-medium text-brand-strong hover:underline">
            Открыть магазин →
          </Link>
          <div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1180px]">
          <AdminAuthGuard>{children}</AdminAuthGuard>
        </div>
      </main>
    </div>
  );
}

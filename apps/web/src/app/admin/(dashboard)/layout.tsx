import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
import { LogoutButton } from "@/components/admin/logout-button";
import { Seal } from "@/components/seal";

// Admin shell: sticky top bar + tabs. AdminAuthGuard redirects to
// /admin/login when the session check fails; the JwtAuthGuard on the API
// enforces it on every actual request regardless.
const tabs = [
  { href: "/admin", label: "Панель" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/discounts", label: "Скидки" },
  { href: "/admin/codes", label: "Коды студентов" },
  { href: "/admin/reservations", label: "Брони" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Seal />
            <span className="font-display text-lg font-semibold text-ink">
              Computerra админ
            </span>
          </Link>
          <nav className="-mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 sm:ml-4 sm:flex-none">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-tint hover:text-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-4 sm:ml-auto">
            <Link
              href="/"
              className="text-sm font-medium text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              В магазин
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-8">
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </main>
    </div>
  );
}

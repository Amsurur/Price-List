import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";
import { Seal } from "@/components/seal";

// Admin shell: sticky top bar + tabs. proxy.ts redirects here-to-/admin/login
// when the auth cookie is missing; the JwtAuthGuard on the API enforces it.
const tabs = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/codes", label: "Student codes" },
  { href: "/admin/reservations", label: "Reservations" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-4 px-6">
          <Link href="/admin/products" className="flex items-center gap-3">
            <Seal />
            <span className="font-display text-lg font-semibold text-ink">
              Softclub admin
            </span>
          </Link>
          <nav className="ml-4 flex items-center gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-brand-tint hover:text-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View store
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

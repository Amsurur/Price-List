"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartIcon,
  ClipboardIcon,
  HomeIcon,
  KeyIcon,
  LaptopIcon,
  TagIcon,
  UploadIcon,
} from "@/components/ui/icons";

const ITEMS = [
  { href: "/admin", label: "Обзор", Icon: HomeIcon, exact: true },
  { href: "/admin/products", label: "Товары", Icon: LaptopIcon, exact: true },
  { href: "/admin/reservations", label: "Брони", Icon: ClipboardIcon },
  { href: "/admin/codes", label: "Коды студентов", Icon: KeyIcon },
  { href: "/admin/discounts", label: "Скидки", Icon: TagIcon },
  { href: "/admin/products/bulk", label: "Загрузка из Excel", Icon: UploadIcon },
  { href: "/admin/analytics", label: "Аналитика", Icon: ChartIcon },
];

// Sidebar links on desktop, a scrolling pill row on phones.
export function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) {
      // "Товары" also covers a product's edit/new pages, but not bulk upload.
      if (href === "/admin/products")
        return pathname === href || /^\/admin\/products\/(new|[^/]+\/edit)/.test(pathname);
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Разделы" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ITEMS.map(({ href, label, Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 shrink-0 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium whitespace-nowrap transition-colors lg:h-11 ${
              active
                ? "bg-brand-tint font-semibold text-brand-strong"
                : "text-ink-soft hover:bg-bg hover:text-ink"
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Seal } from "@/components/seal";
import { SearchIcon } from "@/components/ui/icons";
import { catalogHref } from "@/lib/categories";
import type { AppliedCode } from "@/lib/use-applied-code";
import { ThemeToggle } from "./theme-toggle";

// Sticky storefront header: logo, category chips, search, theme switch and
// the student's code pill (green once a code is applied).
export function StoreHeader({
  categories,
  activeCategory = null,
  appliedCode,
}: {
  categories: string[];
  activeCategory?: string | null;
  appliedCode: AppliedCode | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}#catalog` : "/#catalog");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-full">
          <Seal />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Computerra<span className="text-brand">.store</span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          role="search"
          className="ml-4 hidden h-11 max-w-sm flex-1 items-center gap-2 rounded-full bg-bg px-4 md:flex"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск техники"
            aria-label="Поиск техники"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted focus-visible:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#code"
            className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
              appliedCode
                ? "bg-save-tint text-save-strong"
                : "bg-ink text-surface hover:bg-ink-soft"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-xs font-bold ${
                appliedCode ? "bg-save text-white" : "bg-brand text-white"
              }`}
            >
              S
            </span>
            <span className="tabular hidden sm:inline">
              {appliedCode ? appliedCode.code : "Мой код"}
            </span>
            <span className="sr-only sm:hidden">
              {appliedCode ? `Код ${appliedCode.code} применён` : "Ввести код"}
            </span>
          </Link>
        </div>
      </div>

      {categories.length > 0 && (
        <nav
          aria-label="Категории"
          className="no-scrollbar mx-auto flex max-w-[1240px] gap-1.5 overflow-x-auto px-4 pb-3 sm:px-6"
        >
          <CategoryChip href={catalogHref()} active={activeCategory === null}>
            Все товары
          </CategoryChip>
          {categories.map((c) => (
            <CategoryChip key={c} href={catalogHref(c)} active={activeCategory === c}>
              {c}
            </CategoryChip>
          ))}
        </nav>
      )}
    </header>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors ${
        active ? "bg-brand text-white" : "text-ink-soft hover:bg-bg hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

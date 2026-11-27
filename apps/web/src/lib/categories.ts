import type { Product } from "./types";

export interface CategoryCount {
  name: string;
  count: number;
}

// Categories are free text on each product, so the storefront derives its
// menu from what's actually in stock — most-stocked first.
export function categoriesOf(products: Product[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const name = p.category?.trim();
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
}

export function catalogHref(category?: string | null): string {
  return category ? `/?category=${encodeURIComponent(category)}#catalog` : "/#catalog";
}

// Russian plural for "N товаров" style counts.
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function brandsOf(products: Product[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const name = p.brand?.trim();
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
}

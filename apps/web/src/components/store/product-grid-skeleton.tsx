export const PRODUCT_GRID =
  "grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={PRODUCT_GRID} aria-label="Загружаем товары">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-2.5 pb-4">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-bg" />
          <div className="mx-1.5 h-3 w-1/3 animate-pulse rounded bg-bg" />
          <div className="mx-1.5 h-4 w-4/5 animate-pulse rounded bg-bg" />
          <div className="mx-1.5 h-6 w-1/2 animate-pulse rounded bg-bg" />
          <div className="mx-1.5 h-11 animate-pulse rounded-full bg-bg" />
        </li>
      ))}
    </ul>
  );
}

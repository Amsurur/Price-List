export function ProductGridSkeleton() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li
          key={i}
          className="flex flex-col rounded-xl border border-line bg-surface p-4"
        >
          <div className="aspect-[4/3] animate-pulse rounded-[10px] bg-bg" />
          <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-bg" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-bg" />
          <div className="mt-4 h-9 w-full animate-pulse rounded-xl bg-bg" />
        </li>
      ))}
    </ul>
  );
}

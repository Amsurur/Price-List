export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Рекомендуемые" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "name-asc", label: "По названию" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface pr-2 pl-4 text-sm">
      <span className="text-muted">Сортировка:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="cursor-pointer bg-transparent font-medium text-ink outline-none"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

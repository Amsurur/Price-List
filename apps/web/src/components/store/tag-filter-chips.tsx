export function TagFilterChips({
  tags,
  activeTag,
  onSelect,
}: {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="Все" active={activeTag === null} onClick={() => onSelect(null)} />
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          active={activeTag === tag}
          onClick={() => onSelect(tag)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

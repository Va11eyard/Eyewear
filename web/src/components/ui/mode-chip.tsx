export function ModeChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
        selected
          ? "border-ink bg-ink text-paper"
          : "border-line-2 text-ink-2 hover:border-ink hover:text-ink"
      }`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-paper" : "bg-line-2"}`} />
      {label}
    </button>
  );
}

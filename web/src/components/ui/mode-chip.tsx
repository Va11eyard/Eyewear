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
      className={`inline-flex min-h-10 items-center gap-2.5 border px-4 text-[11px] uppercase tracking-[0.14em] transition-colors ${
        selected
          ? "border-ink bg-ink text-paper"
          : "border-line-2 text-ink-2 hover:border-oxblood hover:text-oxblood"
      }`}
    >
      <span aria-hidden="true" className={`h-px w-4 ${selected ? "bg-paper" : "bg-line-2"}`} />
      {label}
    </button>
  );
}

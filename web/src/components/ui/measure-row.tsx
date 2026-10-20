export function MeasureRow({
  label,
  value,
  unit,
  tolerance,
  band,
}: {
  label: string;
  value: string;
  unit: string;
  tolerance: string;
  band: number;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 border-b border-line py-3 last:border-0">
      <span className="text-sm text-mute">{label}</span>
      <span className="measured text-lg">
        {value}
        <span className="ml-1 text-xs text-mute">{unit}</span>
      </span>
      <span className="col-span-2 flex items-center gap-3">
        <span
          role="img"
          aria-label={`уверенность ${band} процентов`}
          className="block h-1 flex-1 bg-paper-2 ring-1 ring-line"
        >
          <span className="block h-full bg-ink" style={{ width: `${band}%` }} />
        </span>
        <span className="measured text-xs text-mute">{tolerance}</span>
      </span>
    </div>
  );
}

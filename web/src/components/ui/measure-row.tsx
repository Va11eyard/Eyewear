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
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-5 gap-y-2 border-t border-line py-3.5 first:border-t-0">
      <span className="text-[14.5px] text-ink-2">{label}</span>
      <span className="measured text-[15px]">
        {value}
        {unit ? <span className="ml-1 text-[10px] text-mute">{unit}</span> : null}
      </span>
      <span className="col-span-2 flex items-center gap-4">
        <span
          role="img"
          aria-label={`уверенность ${band} процентов`}
          className="block h-[3px] flex-1 bg-paper-2 ring-1 ring-line"
        >
          <span className="block h-full bg-ink" style={{ width: `${band}%` }} />
        </span>
        <span className="measured text-[10px] tracking-[0.08em] text-mute">{tolerance}</span>
      </span>
    </div>
  );
}

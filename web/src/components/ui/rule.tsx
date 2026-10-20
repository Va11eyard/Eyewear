const TICKS =
  "repeating-linear-gradient(90deg, var(--color-line-2) 0 1px, transparent 1px 10px)," +
  "repeating-linear-gradient(90deg, var(--color-line-2) 0 1px, transparent 1px 50px)";

/** The section divider is a millimetre rule, so the page measures itself. */
export function Rule({ labels = ["0", "20", "40", "60", "80 мм"] }: { labels?: string[] }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-8 border-y border-line"
      style={{ backgroundImage: TICKS }}
    >
      {labels.map((label, i) => {
        const last = i === labels.length - 1;
        return (
          <span
            key={label}
            className="measured absolute top-1.5 text-[9px] text-mute"
            style={last ? { right: 0 } : { left: `${(i / labels.length) * 100}%` }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

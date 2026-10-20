/** A single ink-tinted hairline with an optional daybook marker. The houses
 *  studied use one rule, never a double, and no ornamental divider. */
export function Rule({ label }: { label?: string }) {
  return (
    <div aria-hidden="true" className="px-6 md:px-10">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 border-t border-line pt-3">
        {label ? <span className="ledger-label">{label}</span> : null}
      </div>
    </div>
  );
}

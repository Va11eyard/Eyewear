export type Finding = { file: string; rule: Rule; snippet: string };

export type Rule = "em-dash" | "en-dash" | "arrow" | "praise" | "title-period";

const BANNED_GLYPHS: [RegExp, Rule][] = [
  [/(—|–)/g, "em-dash"],
  [/(\u2192|\u2190|\u203a|\u00bb|->)/g, "arrow"],
];

const PRAISE = /(вам идёт|отличн\w*|идеальн\w*|прекрасн\w*|безупречн\w*|лучш\w*\s+(выбор|образ|решени|вариант)|wow|stunning)/giu;

/**
 * The repo's voice rules, enforced in CI rather than remembered. Sentence-final
 * periods are checked only inside JSX text and string literals that look like
 * copy, because a period is also a decimal separator in a size code.
 */
export function describeSource(src: string, file: string): Finding[] {
  const out: Finding[] = [];
  for (const [re, rule] of BANNED_GLYPHS) {
    for (const m of src.matchAll(re)) {
      out.push({ file, rule, snippet: lineAt(src, m.index ?? 0) });
    }
  }
  for (const m of src.matchAll(PRAISE)) {
    out.push({ file, rule: "praise", snippet: lineAt(src, m.index ?? 0) });
  }
  for (const m of src.matchAll(/<(h[1-3])[^>]*>\s*([^<]*[а-яё][^<]*?)\s*<\/\1>/giu)) {
    const text = m[2].trim();
    if (/[.]$/.test(text)) {
      out.push({ file, rule: "title-period", snippet: lineAt(src, m.index ?? 0) });
    }
  }
  return out;
}

function lineAt(src: string, index: number): string {
  const start = src.lastIndexOf("\n", index) + 1;
  const end = src.indexOf("\n", index);
  return src.slice(start, end < 0 ? undefined : end).trim().slice(0, 120);
}

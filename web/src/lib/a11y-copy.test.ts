import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { describeSource, type Finding } from "@/lib/a11y-copy";

function sources(dir: string, base = ""): string[] {
  const root = new URL(dir.startsWith("..") ? dir : `../../${dir}`, import.meta.url);
  const walk = (rel: string): string[] => {
    const abs = new URL(`../../${rel}`, import.meta.url);
    return readdirSync(abs).flatMap((name) => {
      const child = `${rel}/${name}`;
      const st = statSync(new URL(`../../${child}`, import.meta.url));
      if (st.isDirectory()) {
        return walk(child);
      }
      return /\.(tsx|ts)$/.test(name) && !/\.test\./.test(name) ? [child] : [];
    });
  };
  void root;
  return walk(dir);
}

const FILES = [...sources("src/app"), ...sources("src/components")];

describe("voice rules", () => {
  it("scans a real set of shipped source files", () => {
    expect(FILES.length).toBeGreaterThan(10);
  });

  it("finds no banned glyph, praise copy or titled period in the interface", () => {
    const findings: Finding[] = FILES.flatMap((f) =>
      describeSource(readFileSync(new URL(`../../${f}`, import.meta.url), "utf8"), f),
    );
    expect(findings).toEqual([]);
  });
});

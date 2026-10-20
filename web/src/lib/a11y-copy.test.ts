import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { describeSource, type Finding } from "@/lib/a11y-copy";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

function sources(dir: string): string[] {
  const abs = `${ROOT}${dir}`;
  return readdirSync(abs).flatMap((name) => {
    const child = `${abs}/${name}`;
    if (statSync(child).isDirectory()) {
      return sources(`${dir}/${name}`);
    }
    return /\.(tsx|ts)$/.test(name) && !/\.test\./.test(name) ? [child] : [];
  });
}

const FILES = [...sources("src/app"), ...sources("src/components")];

describe("voice rules", () => {
  it("scans a real set of shipped source files", () => {
    expect(FILES.length).toBeGreaterThan(10);
  });

  it("finds no banned glyph, praise copy or titled period in the interface", () => {
    const findings: Finding[] = FILES.map((f) =>
      describeSource(readFileSync(f, "utf8"), f.replace(ROOT, "")),
    ).flat();
    expect(findings).toEqual([]);
  });
});

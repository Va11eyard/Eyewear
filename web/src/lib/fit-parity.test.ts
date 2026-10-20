import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { measure, type Landmark } from "./fit-engine";
import { CATALOG } from "./frames";
import { recommend } from "./recommend";

type Case = {
  name: string;
  landmarks: Landmark[];
  want: {
    ipdMm: number;
    faceWidthMm: number;
    faceHeightMm: number;
    shapeHint: string;
    shapeAgreed: number;
    sizeHint: string;
  };
  wantSKUs: string[];
  wantDeltas: number[];
};

/**
 * The fixture is the contract. Go reads the same file from
 * backend/internal/fit/parity_test.go, so a change to the maths in either
 * language breaks a test rather than silently shipping two products.
 */
const fixturePath = new URL("../../../testdata/fit-parity.json", import.meta.url);
const fixture = JSON.parse(readFileSync(fileURLToPath(fixturePath), "utf8")) as { cases: Case[] };

/**
 * Cases are authored here, expectations are recorded by the TypeScript
 * implementation, and the Go test must agree. Regenerate with
 * `UPDATE_FIXTURE=1 npx vitest run src/lib/fit-parity.test.ts` after an
 * intentional maths or catalogue change, then read the Go failure carefully:
 * a diff you did not intend is a bug, not a fixture to refresh.
 */
const CASES: { name: string; landmarks: Landmark[] }[] = (() => {
  if (process.env.UPDATE_FIXTURE !== "1") {
    return [];
  }
  function face(ipdN: number, cheekDist: number, heightDist: number, foreRatio: number, jawRatio: number): Landmark[] {
    const cy = 0.4;
    const pts: Record<number, [number, number]> = {
      133: [0.5 - ipdN / 2, cy],
      362: [0.5 + ipdN / 2, cy],
      468: [0.5 - ipdN / 2 + 0.01, cy],
      469: [0.5 - ipdN / 2 + 0.022, cy],
      234: [0.5 - cheekDist / 2, cy + 0.05],
      454: [0.5 + cheekDist / 2, cy + 0.05],
      10: [0.5, cy - heightDist / 2],
      152: [0.5, cy + heightDist / 2],
      54: [0.5 - (cheekDist * foreRatio) / 2, cy - heightDist * 0.32],
      284: [0.5 + (cheekDist * foreRatio) / 2, cy - heightDist * 0.32],
      172: [0.5 - (cheekDist * jawRatio) / 2, cy + heightDist * 0.3],
      397: [0.5 + (cheekDist * jawRatio) / 2, cy + heightDist * 0.3],
    };
    return Object.entries(pts).map(([index, [x, y]]) => ({ index: Number(index), x, y, z: 0 }));
  }
  return [
    { name: "medium-oval", landmarks: face(0.12, 0.2975, 0.242, 0.86, 0.72) },
    { name: "narrow-round", landmarks: face(0.115, 0.262, 0.238, 0.8, 0.86) },
    { name: "wide-square", landmarks: face(0.126, 0.318, 0.236, 0.92, 0.9) },
    { name: "beyond-catalog", landmarks: face(0.126, 0.345, 0.236, 0.92, 0.9) },
  ];
})();

if (process.env.UPDATE_FIXTURE === "1") {
  const cases = CASES.map((c) => {
    const head = measure(c.landmarks);
    const picks = recommend(head, CATALOG);
    return {
      name: c.name,
      landmarks: c.landmarks,
      want: {
        ipdMm: head.ipdMm,
        faceWidthMm: head.faceWidthMm,
        faceHeightMm: head.faceHeightMm,
        shapeHint: head.shapeHint,
        shapeAgreed: head.shapeAgreed,
        sizeHint: head.sizeHint,
      },
      wantSKUs: picks.map((p) => p.frame.sku),
      wantDeltas: picks.map((p) => p.deltaMm),
    };
  });
  writeFileSync(fileURLToPath(fixturePath), JSON.stringify({ cases }, null, 2) + "\n");
  console.log("fixture rewritten:", cases.map((c) => `${c.name} -> ${c.wantSKUs.join(",")}`));
}

describe.skipIf(process.env.UPDATE_FIXTURE === "1")("fit parity against the shared fixture", () => {
  it("covers the cases the Go side expects", () => {
    expect(fixture.cases.map((c) => c.name)).toEqual([
      "medium-oval",
      "narrow-round",
      "wide-square",
      "beyond-catalog",
    ]);
  });

  for (const c of fixture.cases) {
    it(`reproduces ${c.name}`, () => {
      const head = measure(c.landmarks);
      expect(head.ipdMm, `${c.name} ipd`).toBeCloseTo(c.want.ipdMm, 1);
      expect(head.faceWidthMm, `${c.name} width`).toBeCloseTo(c.want.faceWidthMm, 1);
      expect(head.faceHeightMm, `${c.name} height`).toBeCloseTo(c.want.faceHeightMm, 1);
      expect(head.shapeHint, `${c.name} shape`).toBe(c.want.shapeHint);
      expect(head.shapeAgreed, `${c.name} agreed`).toBe(c.want.shapeAgreed);
      expect(head.sizeHint, `${c.name} size`).toBe(c.want.sizeHint);

      const picks = recommend(head, CATALOG);
      expect(picks.map((p) => p.frame.sku)).toEqual(c.wantSKUs);
      expect(picks.map((p) => p.deltaMm)).toEqual(c.wantDeltas);
    });
  }

  it("returns nothing rather than three ill-fitting frames when the face is outside the catalogue", () => {
    const c = fixture.cases.find((x) => x.name === "beyond-catalog");
    expect(c?.wantSKUs).toEqual([]);
  });
});

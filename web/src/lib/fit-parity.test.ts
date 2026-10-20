import { readFileSync } from "node:fs";
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
const fixture = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../testdata/fit-parity.json", import.meta.url)), "utf8"),
) as { cases: Case[] };

describe("fit parity against the shared fixture", () => {
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

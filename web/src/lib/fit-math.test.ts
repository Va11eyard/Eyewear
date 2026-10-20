import { describe, expect, it } from "vitest";
import { confidenceBand, fitDeltaMm, targetFrontWidthMm, WIDTH_TOLERANCE_MM } from "@/lib/fit-math";
import type { Frame } from "@/lib/frame-catalog";

const base: Omit<Frame, "lensWidthMm" | "bridgeMm"> = {
  sku: "X",
  name: "X",
  shape: "rect",
  material: "acetate",
  color: "black",
  colorRu: "Чёрный, графит",
  templeMm: 145,
  weightG: 22,
  priceTenge: 0,
  mesh: "rig:rect",
  colors: ["black"],
  anchor: { pupilY: 0, frontZ: 0, hingeX: 1 },
};

const head = {
  ipdMm: 63,
  faceWidthMm: 145,
  faceHeightMm: 118,
  shapeHint: "oval",
  sizeHint: "M",
};

describe("fit maths", () => {
  it("targets a front slightly wider than the measured face", () => {
    expect(targetFrontWidthMm(head)).toBe(150);
  });

  it("reports the signed millimetre gap between frame and face", () => {
    const snug = fitDeltaMm(head, { ...base, lensWidthMm: 54, bridgeMm: 20 });
    expect(Math.abs(snug)).toBeLessThanOrEqual(WIDTH_TOLERANCE_MM);
    const tight = fitDeltaMm(head, { ...base, lensWidthMm: 47, bridgeMm: 21 });
    expect(tight).toBeLessThan(-WIDTH_TOLERANCE_MM);
  });

  it("treats a wider bridge as a wider front", () => {
    const narrow = fitDeltaMm(head, { ...base, lensWidthMm: 52, bridgeMm: 14 });
    const wide = fitDeltaMm(head, { ...base, lensWidthMm: 52, bridgeMm: 21 });
    expect(wide).toBeGreaterThan(narrow);
  });

  it("maps agreement counts to bands instead of inventing percentages", () => {
    expect(confidenceBand(5).label).toBe("уверенно");
    expect(confidenceBand(4).label).toBe("уверенно");
    expect(confidenceBand(3).label).toBe("ориентировочно");
    expect(confidenceBand(1).label).toBe("слабо");
    expect(confidenceBand(0)).toEqual({ label: "нет данных", pct: 0 });
  });

  it("keeps bands monotonic", () => {
    const pcts = [0, 1, 2, 3, 4, 5].map(confidenceBand).map((b) => b.pct);
    expect(pcts).toEqual([...pcts].sort((a, b) => a - b));
  });
});

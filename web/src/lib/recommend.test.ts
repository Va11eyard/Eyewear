import { describe, expect, it } from "vitest";
import { CATALOG } from "@/lib/frames";
import { recommend } from "@/lib/recommend";
import { WIDTH_TOLERANCE_MM } from "@/lib/fit-math";

const head = {
  ipdMm: 63,
  faceWidthMm: 145,
  faceHeightMm: 118,
  shapeHint: "oval",
  sizeHint: "M",
  shapeAgreed: 4,
};

describe("Top-3 selection", () => {
  it("returns exactly three suggestions", () => {
    expect(recommend(head, CATALOG)).toHaveLength(3);
  });

  it("never suggests a frame outside the width tolerance", () => {
    for (const s of recommend(head, CATALOG)) {
      expect(Math.abs(s.deltaMm), `${s.frame.sku} delta`).toBeLessThanOrEqual(WIDTH_TOLERANCE_MM);
    }
  });

  it("suggests distinct shapes when the catalogue offers them", () => {
    const shapes = recommend(head, CATALOG).map((s) => s.frame.shape);
    expect(new Set(shapes).size).toBe(shapes.length);
  });

  it("gives each suggestion two or three reasons", () => {
    for (const s of recommend(head, CATALOG)) {
      expect(s.reasons.length, s.frame.sku).toBeGreaterThanOrEqual(2);
      expect(s.reasons.length, s.frame.sku).toBeLessThanOrEqual(3);
    }
  });

  it("states millimetres and never praises", () => {
    const text = recommend(head, CATALOG).flatMap((s) => s.reasons).join(" ");
    expect(text).toMatch(/мм/);
    expect(text).not.toMatch(/идёт|отличн|идеальн|прекрас|лучш/iu);
  });

  it("honours exclusions and backfills", () => {
    const first = recommend(head, CATALOG)[0].frame.sku;
    const after = recommend(head, CATALOG, { exclude: [first] });
    expect(after.map((s) => s.frame.sku)).not.toContain(first);
    expect(after).toHaveLength(3);
  });

  it("drops to size-only ranking when the shape call is weak", () => {
    const weak = { ...head, shapeHint: "unknown", shapeAgreed: 2 };
    const out = recommend(weak, CATALOG);
    expect(out).toHaveLength(3);
    expect(out[0].reasons.join(" ")).toMatch(/размер|ширин/i);
    expect(out[0].reasons.join(" ")).not.toMatch(/форм/);
  });

  it("carries the millimetre delta through to the UI", () => {
    const [top] = recommend(head, CATALOG);
    expect(top.band).toBeGreaterThan(0);
    expect(top.reasons[0]).toContain(String(Math.abs(top.deltaMm)));
  });
});

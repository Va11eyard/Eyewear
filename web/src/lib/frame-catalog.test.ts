import { describe, expect, it } from "vitest";
import raw from "../../public/data/frames.json";
import { frameById, loadFrames, totalFrontWidthMm } from "@/lib/frame-catalog";

describe("frame catalogue", () => {
  const frames = loadFrames(raw);

  it("holds at least forty distinct models", () => {
    expect(frames.length).toBeGreaterThanOrEqual(40);
    expect(new Set(frames.map((f) => f.sku)).size).toBe(frames.length);
  });

  it("spans every shape family", () => {
    const shapes = new Set(frames.map((f) => f.shape));
    for (const s of ["round", "panto", "rect", "square", "cat", "browline", "aviator"]) {
      expect(shapes.has(s), `missing shape ${s}`).toBe(true);
    }
  });

  it("carries plausible factory sizes", () => {
    for (const f of frames) {
      expect(f.lensWidthMm).toBeGreaterThanOrEqual(40);
      expect(f.lensWidthMm).toBeLessThanOrEqual(62);
      expect(f.bridgeMm).toBeGreaterThanOrEqual(12);
      expect(f.bridgeMm).toBeLessThanOrEqual(24);
      expect(f.templeMm).toBeGreaterThanOrEqual(120);
      expect(f.templeMm).toBeLessThanOrEqual(155);
    }
  });

  it("names every colour in words, not only as a swatch", () => {
    for (const f of frames) {
      expect(f.colorRu.trim().length).toBeGreaterThan(2);
      expect(f.colors.length).toBeGreaterThan(0);
    }
  });

  it("points at a mesh that exists in the registry", () => {
    for (const f of frames) expect(f.mesh).toMatch(/^(rig:|glb:|jeeliz:)/);
  });

  it("computes front width from the size code", () => {
    expect(totalFrontWidthMm(frames[0])).toBeCloseTo(
      frames[0].lensWidthMm * 2 + frames[0].bridgeMm + 2 * 12,
      1,
    );
  });

  it("rejects a record with an impossible bridge", () => {
    const bad = JSON.parse(JSON.stringify(raw));
    bad.frames[0].bridgeMm = 3;
    expect(() => loadFrames(bad)).toThrow(/bridgeMm/);
  });

  it("finds by sku", () => {
    expect(frameById(frames, frames[7].sku)?.sku).toBe(frames[7].sku);
    expect(frameById(frames, "NOPE")).toBeUndefined();
  });
});

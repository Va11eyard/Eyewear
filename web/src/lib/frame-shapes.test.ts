import { describe, expect, it } from "vitest";
import { depthMm, lensHeightMm, PROFILES, rimProfile, rimWidthMm } from "@/lib/frame-shapes";

const SHAPES = ["round", "panto", "rect", "square", "cat", "browline", "aviator"];

function bounds(shape: THREE_ShapeLike) {
  const pts = shape.getPoints(64);
  return {
    top: Math.max(...pts.map((p) => p.y)),
    bottom: Math.min(...pts.map((p) => p.y)),
    left: Math.min(...pts.map((p) => p.x)),
    right: Math.max(...pts.map((p) => p.x)),
  };
}

type THREE_ShapeLike = { getPoints(n: number): { x: number; y: number }[] };

describe("frame shape profiles", () => {
  it("keeps height a plausible share of width for every family", () => {
    for (const s of SHAPES) {
      const h = lensHeightMm(s, 52);
      expect(h, s).toBeGreaterThan(52 * 0.5);
      expect(h, s).toBeLessThan(52 * 1.05);
    }
  });

  it("tapers panto and aviator toward the bottom", () => {
    for (const s of ["panto", "aviator"]) {
      const pts = PROFILES[s];
      const avgAbsX = (keep: (p: [number, number]) => boolean) => {
        const sel = pts.filter(keep);
        return sel.reduce((a, p) => a + Math.abs(p[0]), 0) / sel.length;
      };
      expect(avgAbsX((p) => p[1] > 0.15), `${s} upper width`).toBeGreaterThan(
        avgAbsX((p) => p[1] < -0.15),
      );
    }
  });

  it("keeps round symmetric and browline shallow", () => {
    const b = bounds(rimProfile("round", 50, lensHeightMm("round", 50), 5, true));
    expect(b.top).toBeCloseTo(-b.bottom, 1);
    expect(lensHeightMm("browline", 54)).toBeLessThan(lensHeightMm("rect", 54));
  });

  it("mirrors the left and right eye", () => {
    for (const s of SHAPES) {
      const h = lensHeightMm(s, 50);
      const l = rimProfile(s, 50, h, 5, true).getPoints(48);
      const r = rimProfile(s, 50, h, 5, false).getPoints(48);
      expect(Math.min(...l.map((p) => p.x))).toBeCloseTo(-Math.max(...r.map((p) => p.x)), 2);
    }
  });

  it("cuts a hole so the rim is a ring, not a solid lens", () => {
    for (const s of SHAPES) {
      const p = rimProfile(s, 50, lensHeightMm(s, 50), 5, true);
      expect(p.holes.length, s).toBe(1);
    }
  });

  it("orders rim thickness and depth by material", () => {
    expect(rimWidthMm("acetate")).toBeGreaterThan(rimWidthMm("metal"));
    expect(depthMm("acetate")).toBeGreaterThan(depthMm("combo"));
    expect(depthMm("combo")).toBeGreaterThan(depthMm("metal"));
  });

  it("widens the outer profile by the rim, never by the lens", () => {
    const inner = bounds(rimProfile("rect", 50, lensHeightMm("rect", 50), 5, true));
    expect(inner.right - inner.left).toBeGreaterThan(50);
    expect(inner.right - inner.left).toBeLessThan(50 + 2 * 5 + 2);
  });
});

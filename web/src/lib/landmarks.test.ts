import { describe, expect, it } from "vitest";
import { coverPoint, glassesPose, serializeLandmarks } from "./landmarks";

function mesh(): { x: number; y: number; z?: number }[] {
  const pts = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  pts[33] = { x: 0.32, y: 0.41 };
  pts[263] = { x: 0.68, y: 0.43 };
  pts[133] = { x: 0.4, y: 0.42 };
  pts[362] = { x: 0.6, y: 0.42 };
  pts[168] = { x: 0.5, y: 0.44 };
  return pts;
}

describe("serializeLandmarks", () => {
  it("keeps mediapipe indices", () => {
    const got = serializeLandmarks([{ x: 0.1, y: 0.2, z: -0.01 }]);
    expect(got).toEqual([{ index: 0, x: 0.1, y: 0.2, z: -0.01 }]);
  });
});

describe("glassesPose", () => {
  it("returns null when mesh is short", () => {
    expect(glassesPose([{ x: 0, y: 0 }])).toBeNull();
  });

  it("places the frame between the eyes", () => {
    const pose = glassesPose(mesh());
    expect(pose).not.toBeNull();
    expect(pose?.cx).toBeCloseTo(0.5);
    expect(pose?.width).toBeGreaterThan(0.5);
    expect(pose?.rotate).not.toBe(0);
  });

  it("scales to catalog millimetres", () => {
    const pose = glassesPose(mesh(), { lensWidthMm: 50, bridgeMm: 22, ipdMm: 63 });
    expect(pose?.width).toBeCloseTo(0.506, 2);
  });

  it("tilts with depth", () => {
    const pts = mesh();
    pts[33] = { x: 0.32, y: 0.41, z: 0.08 };
    pts[263] = { x: 0.68, y: 0.43, z: -0.08 };
    const pose = glassesPose(pts);
    expect(pose?.rotateY).not.toBe(0);
  });

  it("rejects collapsed eyes", () => {
    const pts = mesh();
    pts[33] = { x: 0.5, y: 0.5 };
    pts[263] = { x: 0.501, y: 0.5 };
    expect(glassesPose(pts)).toBeNull();
  });
});

describe("coverPoint", () => {
  it("maps cover-fit coordinates", () => {
    const p = coverPoint(0.5, 0.5, 200, 200, 200, 100);
    expect(p.x).toBe(100);
    expect(p.y).toBe(100);
  });
});

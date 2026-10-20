import { describe, expect, it } from "vitest";
import { computeGlassesTransform, pxPerMm } from "./try-on-math";
import type { Point } from "./landmarks";

function face(leftX: number, rightX: number, y = 0.4): Point[] {
  const pts: Point[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  pts[33] = { x: leftX, y, z: 0 };
  pts[263] = { x: rightX, y, z: 0 };
  pts[168] = { x: (leftX + rightX) / 2, y, z: 0 };
  return pts;
}

const VIEW = { w: 400, h: 500, vw: 1280, vh: 960 };
const FRAME = { lensWidthMm: 52, bridgeMm: 18 };

describe("glasses transform", () => {
  it("refuses to place anything without a full mesh", () => {
    expect(computeGlassesTransform(face(0.4, 0.6).slice(0, 100), FRAME, VIEW)).toBeNull();
  });

  it("refuses a collapsed pupil line", () => {
    expect(computeGlassesTransform(face(0.5, 0.5001), FRAME, VIEW)).toBeNull();
  });

  it("centres the front between the pupils", () => {
    const t = computeGlassesTransform(face(0.4, 0.6), FRAME, VIEW);
    expect(t).not.toBeNull();
    expect(t!.x).toBeCloseTo(200, 0);
  });

  it("grows the overlay as the face comes closer", () => {
    const far = computeGlassesTransform(face(0.45, 0.55), FRAME, VIEW)!;
    const near = computeGlassesTransform(face(0.35, 0.65), FRAME, VIEW)!;
    expect(near.scale).toBeGreaterThan(far.scale * 1.5);
  });

  it("follows a tilted pupil line", () => {
    const pts = face(0.4, 0.6, 0.4);
    pts[263] = { x: 0.6, y: 0.45, z: 0 };
    const t = computeGlassesTransform(pts, FRAME, VIEW)!;
    expect(t.rotate).toBeGreaterThan(1);
  });

  it("returns null rather than a zero scale that would hide the mesh silently", () => {
    expect(computeGlassesTransform(face(0.4, 0.6), { lensWidthMm: 0, bridgeMm: 0 }, VIEW)).toBeNull();
  });
});

describe("pixel to millimetre ratio", () => {
  it("maps catalog front width to pixels", () => {
    expect(pxPerMm(122, 50, 22)).toBe(1);
  });

  it("rejects empty geometry", () => {
    expect(pxPerMm(100, 0, 0)).toBe(0);
    expect(pxPerMm(0, 50, 22)).toBe(0);
  });
});

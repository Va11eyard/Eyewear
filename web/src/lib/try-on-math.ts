import { coverPoint, glassesPose, type Point } from "@/lib/landmarks";

export function pxPerMm(frontWidthPx: number, lensWidthMm: number, bridgeMm: number): number {
  const mm = lensWidthMm * 2 + bridgeMm;
  if (mm <= 0 || frontWidthPx <= 0) {
    return 0;
  }
  return frontWidthPx / mm;
}

export type View = { w: number; h: number; vw: number; vh: number };

export type GlassesTransform = {
  x: number;
  y: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotate: number;
};

/**
 * Placement for the overlay, in CSS pixels of the element it covers.
 * The renderer still flips Y, since the orthographic camera looks down the
 * positive axis while landmark rows count from the top of the frame.
 */
export function computeGlassesTransform(
  points: Point[],
  frame: { lensWidthMm: number; bridgeMm: number },
  view: View,
  ipdMm?: number,
): GlassesTransform | null {
  const pose = glassesPose(points, { lensWidthMm: frame.lensWidthMm, bridgeMm: frame.bridgeMm, ipdMm });
  if (!pose) {
    return null;
  }
  const placed = coverPoint(pose.cx, pose.cy, view.w, view.h, view.vw, view.vh);
  const frontPx = pose.width * placed.scale * view.vw;
  const scale = pxPerMm(frontPx, frame.lensWidthMm, frame.bridgeMm);
  if (!(scale > 0) || !Number.isFinite(scale)) {
    return null;
  }
  return {
    x: placed.x,
    y: placed.y,
    scale,
    rotateX: pose.rotateX,
    rotateY: -pose.rotateY,
    rotate: pose.rotate,
  };
}

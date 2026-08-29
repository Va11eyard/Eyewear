export type Point = { x: number; y: number; z?: number };

export type ApiLandmark = {
  index: number;
  x: number;
  y: number;
  z: number;
};

export type FrameSpec = {
  lensWidthMm: number;
  bridgeMm: number;
  ipdMm?: number;
};

export type GlassesPose = {
  cx: number;
  cy: number;
  width: number;
  rotate: number;
  rotateY: number;
  rotateX: number;
};

export function serializeLandmarks(points: Point[]): ApiLandmark[] {
  const out: ApiLandmark[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    out.push({ index: i, x: p.x, y: p.y, z: p.z ?? 0 });
  }
  return out;
}

export function glassesPose(points: Point[], spec?: FrameSpec): GlassesPose | null {
  if (points.length < 264) {
    return null;
  }
  const left = points[33];
  const right = points[263];
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const span = Math.hypot(dx, dy);
  if (span < 0.02) {
    return null;
  }
  const bridge = points[168] ?? points[6];
  const tilt = poseTilt(left, right, bridge);
  return {
    cx: (left.x + right.x) / 2,
    cy: (left.y + right.y) / 2,
    width: frameWidth(span, spec),
    rotate: (Math.atan2(dy, dx) * 180) / Math.PI,
    rotateY: tilt.y,
    rotateX: tilt.x,
  };
}

function poseTilt(left: Point, right: Point, bridge?: Point): { x: number; y: number } {
  const midZ = ((left.z ?? 0) + (right.z ?? 0)) / 2;
  return {
    y: clampDeg(((left.z ?? 0) - (right.z ?? 0)) * 140, -28, 28),
    x: clampDeg(((bridge?.z ?? 0) - midZ) * 80, -12, 12),
  };
}

function frameWidth(outerSpan: number, spec?: FrameSpec): number {
  if (!spec) {
    return outerSpan * 2.05;
  }
  const ipdMm = spec.ipdMm && spec.ipdMm > 40 ? spec.ipdMm : 63;
  const frontMm = spec.lensWidthMm * 2 + spec.bridgeMm;
  const outerMm = ipdMm * 1.38;
  return outerSpan * (frontMm / outerMm);
}

function clampDeg(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function coverPoint(
  nx: number,
  ny: number,
  elW: number,
  elH: number,
  vidW: number,
  vidH: number,
): { x: number; y: number; scale: number } {
  const scale = Math.max(elW / Math.max(vidW, 1), elH / Math.max(vidH, 1));
  const dw = vidW * scale;
  const dh = vidH * scale;
  return {
    x: (elW - dw) / 2 + nx * dw,
    y: (elH - dh) / 2 + ny * dh,
    scale,
  };
}

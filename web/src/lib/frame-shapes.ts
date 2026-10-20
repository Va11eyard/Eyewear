import * as THREE from "three";

/**
 * Lens outlines per shape family, normalised to a unit box with y up.
 * These are the same numbers the extrusion and the fit maths consume, so a
 * catalogue picture cannot disagree with the size code on the temple.
 */
export type Profile = [number, number][];

export const PROFILES: Record<string, Profile> = {
  panto: [
    [0.0, 0.44], [0.26, 0.46], [0.44, 0.4], [0.5, 0.22], [0.46, -0.06], [0.36, -0.28],
    [0.16, -0.46], [-0.16, -0.46], [-0.36, -0.28], [-0.46, -0.06], [-0.5, 0.22], [-0.44, 0.4], [-0.26, 0.46],
  ],
  aviator: [
    [0.0, 0.46], [0.4, 0.5], [0.5, 0.28], [0.4, -0.1], [0.12, -0.44],
    [-0.16, -0.5], [-0.42, -0.24], [-0.5, 0.16], [-0.36, 0.42],
  ],
  browline: [
    [0.0, 0.5], [0.42, 0.48], [0.5, 0.3], [0.44, -0.1], [0.22, -0.46],
    [-0.06, -0.5], [-0.36, -0.34], [-0.5, 0.02], [-0.48, 0.36],
  ],
  cat: [
    [0.0, 0.34], [0.36, 0.5], [0.5, 0.3], [0.44, -0.14], [0.14, -0.46],
    [-0.2, -0.5], [-0.46, -0.28], [-0.5, 0.1], [-0.3, 0.34],
  ],
};

const RATIOS: Record<string, number> = {
  round: 0.94,
  panto: 0.88,
  rect: 0.7,
  square: 0.9,
  cat: 0.68,
  browline: 0.62,
  aviator: 0.92,
  oval: 0.62,
};

export function lensHeightMm(shape: string, lensWidthMm: number): number {
  return lensWidthMm * (RATIOS[shape] ?? RATIOS.rect);
}

export function rimWidthMm(material: string): number {
  return material === "metal" ? 1.7 : 5.2;
}

export function depthMm(material: string): number {
  if (material === "metal") return 2.1;
  if (material === "combo") return 4.4;
  return 5.4;
}

export function eyeCenterX(lensWidthMm: number, bridgeMm: number): number {
  return lensWidthMm / 2 + bridgeMm / 2;
}

/**
 * Control points are resampled through a closed catmull-rom spline, because a
 * ten point polygon extruded as-is gives visible facets on every curve and is
 * the fastest way to make a frame look synthetic.
 */
function smooth(pts: Profile, hole: boolean): THREE.Shape {
  const curve = new THREE.CatmullRomCurve3(
    pts.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    true,
    "centripetal",
    0.5,
  );
  const sampled = curve.getPoints(160).map((v) => ({ x: v.x, y: v.y }));
  const ring = hole ? sampled.reverse() : sampled;
  const s = new THREE.Shape();
  s.moveTo(ring[0].x, ring[0].y);
  for (let i = 1; i < ring.length; i += 1) {
    s.lineTo(ring[i].x, ring[i].y);
  }
  s.closePath();
  return s;
}

function roundedRect(w: number, h: number, rad: number): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(rad, hw * 0.45, hh * 0.45);
  const s = new THREE.Shape();
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
}

function scalePath(s: THREE.Shape, sx: number, sy: number) {
  const apply = (v: THREE.Vector2) => {
    v.x *= sx;
    v.y *= sy;
  };
  s.curves.forEach((c) => {
    const any = c as unknown as { startPoint?: THREE.Vector2; endPoint?: THREE.Vector2; points?: THREE.Vector2[] };
    if (any.startPoint) apply(any.startPoint);
    if (any.endPoint) apply(any.endPoint);
    any.points?.forEach(apply);
  });
  s.holes.forEach((h) =>
    h.curves.forEach((c) => {
      const any = c as unknown as { startPoint?: THREE.Vector2; endPoint?: THREE.Vector2; points?: THREE.Vector2[] };
      if (any.startPoint) apply(any.startPoint);
      if (any.endPoint) apply(any.endPoint);
      any.points?.forEach(apply);
    }),
  );
}

/** The opening a lens occupies, sized in millimetres and mirrored per side. */
export function lensProfile(shape: string, w: number, h: number, left: boolean, hole = false): THREE.Shape {
  const k = left ? 1 : -1;
  if (shape === "rect" || shape === "square") {
    const s = roundedRect(w, h, shape === "square" ? 6.5 : 3.8);
    if (k < 0) scalePath(s, -1, 1);
    return s;
  }
  if (!PROFILES[shape] || shape === "round" || shape === "oval") {
    const s = new THREE.Shape();
    s.absellipse(0, 0, w / 2, h / 2, 0, Math.PI * 2, hole, 0);
    return s;
  }
  const pts = PROFILES[shape].map(([x, y]) => [x * k * w, y * h] as [number, number]);
  return smooth(pts, hole);
}

/** Rim ring: the lens opening grown outward by the rim, with the opening cut back out. */
export function rimProfile(shape: string, w: number, h: number, rimW: number, left: boolean): THREE.Shape {
  const outer = lensProfile(shape, w + rimW * 2, h + rimW * 1.7, left, false);
  outer.holes.push(lensProfile(shape, w, h, left, true));
  return outer;
}

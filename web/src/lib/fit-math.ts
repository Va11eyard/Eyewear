import { totalFrontWidthMm, type Frame } from "@/lib/frame-catalog";

/**
 * A frame front sits outside the bizygomatic measurement, so the target is the
 * measured face plus the set-back of the temples. Without this allowance every
 * comfortable frame would read as too wide.
 */
export const TEMPLE_ALLOWANCE_MM = 5;
export const WIDTH_TOLERANCE_MM = 6;

export type FitHead = {
  ipdMm: number;
  faceWidthMm: number;
  faceHeightMm: number;
  shapeHint: string;
  sizeHint: string;
  shapeAgreed?: number;
};

export type Band = { label: string; pct: number };

export function targetFrontWidthMm(head: FitHead): number {
  return round1(head.faceWidthMm + TEMPLE_ALLOWANCE_MM);
}

export function fitDeltaMm(head: FitHead, f: Frame): number {
  return round1(totalFrontWidthMm(f) - targetFrontWidthMm(head));
}

export function fitsWidth(deltaMm: number): boolean {
  return Math.abs(deltaMm) <= WIDTH_TOLERANCE_MM;
}

/**
 * Confidence is a count of independent cues that reached the same shape class,
 * not a probability the model does not have.
 */
export function confidenceBand(agreed: number): Band {
  if (agreed >= 5) return { label: "уверенно", pct: 96 };
  if (agreed === 4) return { label: "уверенно", pct: 88 };
  if (agreed === 3) return { label: "ориентировочно", pct: 66 };
  if (agreed === 2) return { label: "слабо", pct: 42 };
  if (agreed === 1) return { label: "слабо", pct: 20 };
  return { label: "нет данных", pct: 0 };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

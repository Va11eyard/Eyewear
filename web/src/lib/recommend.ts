import { totalFrontWidthMm, type Frame } from "@/lib/frame-catalog";
import {
  confidenceBand,
  fitDeltaMm,
  fitsWidth,
  targetFrontWidthMm,
  type FitHead,
} from "@/lib/fit-math";
import { pairShapeScore } from "@/lib/fit-engine";

export type Suggestion = {
  frame: Frame;
  deltaMm: number;
  band: number;
  reasons: string[];
  shape: string;
};

const SHAPE_RU: Record<string, string> = {
  round: "круглые",
  panto: "панто",
  rect: "прямоугольные",
  square: "квадратные",
  cat: "кошачий глаз",
  browline: "броулайны",
  aviator: "авиаторы",
};

const FACE_RU: Record<string, string> = {
  oval: "овальному лицу",
  round: "круглому лицу",
  square: "квадратному лицу",
  heart: "сердцевидному лицу",
  diamond: "ромбовидному лицу",
  oblong: "вытянутому лицу",
};

export function recommend(
  head: FitHead,
  frames: Frame[],
  opts: { exclude?: string[]; limit?: number } = {},
): Suggestion[] {
  const limit = opts.limit ?? 3;
  const agreed = head.shapeAgreed ?? 3;
  const sizeOnly = head.shapeHint === "unknown" || agreed < 3;
  const ranked = rankCandidates(head, frames, new Set(opts.exclude ?? []), sizeOnly);
  return pickDistinct(ranked, limit, head, confidenceBand(agreed).pct, sizeOnly);
}

type Candidate = { frame: Frame; delta: number };

function rankCandidates(
  head: FitHead,
  frames: Frame[],
  excluded: Set<string>,
  sizeOnly: boolean,
): Candidate[] {
  return frames
    .filter((f) => !excluded.has(f.sku))
    .map((f) => ({ frame: f, delta: fitDeltaMm(head, f) }))
    .filter((c) => fitsWidth(c.delta))
    .sort((a, b) => score(b, head, sizeOnly) - score(a, head, sizeOnly)
      || Math.abs(a.delta) - Math.abs(b.delta)
      || cmpSku(a.frame.sku, b.frame.sku));
}

/** ТЗ FR-M05 asks for different shapes when the catalogue can offer them. When
 *  it cannot, the next best frames backfill rather than the list going short. */
function pickDistinct(
  ranked: Candidate[],
  limit: number,
  head: FitHead,
  band: number,
  sizeOnly: boolean,
): Suggestion[] {
  const target = targetFrontWidthMm(head);
  const make = (c: Candidate) => toSuggestion(c.frame, c.delta, head, band, sizeOnly, target);
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const c of ranked) {
    if (seen.has(c.frame.shape)) continue;
    seen.add(c.frame.shape);
    out.push(make(c));
    if (out.length === limit) return out;
  }
  for (const c of ranked) {
    if (out.length === limit) break;
    if (!out.some((s) => s.frame.sku === c.frame.sku)) out.push(make(c));
  }
  return out;
}

function cmpSku(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function score(c: Candidate, head: FitHead, sizeOnly: boolean): number {
  const width = 100 - Math.abs(c.delta) * 8;
  if (sizeOnly) {
    return width;
  }
  return pairShapeScore(head.shapeHint, c.frame.shape) * 0.5 + width * 0.5;
}

function toSuggestion(
  frame: Frame,
  delta: number,
  head: FitHead,
  band: number,
  sizeOnly: boolean,
  target: number,
): Suggestion {
  const gap = `${delta > 0 ? "+" : ""}${delta}`;
  const reasons = [
    `Ширина оправы ${totalFrontWidthMm(frame)} мм против ${target} мм на вашем лице, разница ${gap} мм`,
  ];
  if (!sizeOnly) {
    reasons.push(
      `Форма ${SHAPE_RU[frame.shape] ?? frame.shape} взята как контраст к ${FACE_RU[head.shapeHint] ?? "вашему лицу"}`,
    );
  }
  reasons.push(
    frame.bridgeMm <= 21
      ? `Мост ${frame.bridgeMm} мм ложится на переносицу без давления`
      : `Дужка ${frame.templeMm} мм`,
  );
  return { frame, deltaMm: delta, band, reasons, shape: frame.shape };
}

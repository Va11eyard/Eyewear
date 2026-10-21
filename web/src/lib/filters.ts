import { totalFrontWidthMm, type Frame } from "@/lib/frame-catalog";
import { fitDeltaMm, type FitHead } from "@/lib/fit-math";

export type FilterState = {
  shapes: string[];
  materials: string[];
  minFront: number;
  maxFront: number;
  query: string;
};

export const EMPTY_FILTERS: FilterState = {
  shapes: [],
  materials: [],
  minFront: 120,
  maxFront: 165,
  query: "",
};

export function applyFilters(frames: Frame[], s: FilterState): Frame[] {
  const q = s.query.trim().toLowerCase();
  return frames.filter((f) => {
    if (s.shapes.length && !s.shapes.includes(f.shape)) return false;
    if (s.materials.length && !s.materials.includes(f.material)) return false;
    const front = totalFrontWidthMm(f);
    if (front < s.minFront || front > s.maxFront) return false;
    if (q && !`${f.name} ${f.colorRu} ${f.sku}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

/** Measured faces sort by how far the frame sits from the target, closest first. */
export function sortByFit(frames: Frame[], head: FitHead | null): Frame[] {
  if (!head) {
    return [...frames].sort((a, b) => (a.shape < b.shape ? -1 : a.shape > b.shape ? 1 : cmp(a.sku, b.sku)));
  }
  return [...frames].sort((a, b) => Math.abs(fitDeltaMm(head, a)) - Math.abs(fitDeltaMm(head, b)) || cmp(a.sku, b.sku));
}

export function facets(frames: Frame[]): { shapes: [string, number][]; materials: [string, number][] } {
  const tally = (key: (f: Frame) => string) => {
    const m = new Map<string, number>();
    for (const f of frames) m.set(key(f), (m.get(key(f)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]));
  };
  return { shapes: tally((f) => f.shape), materials: tally((f) => f.material) };
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

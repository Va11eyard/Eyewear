import { describe, expect, it } from "vitest";
import { CATALOG } from "@/lib/frames";
import { totalFrontWidthMm } from "@/lib/frame-catalog";
import { applyFilters, EMPTY_FILTERS, facets, sortByFit } from "@/lib/filters";

const head = { ipdMm: 63, faceWidthMm: 145, faceHeightMm: 118, shapeHint: "oval", sizeHint: "M", shapeAgreed: 4 };

describe("catalogue filters", () => {
  it("returns everything when nothing is selected", () => {
    expect(applyFilters(CATALOG, EMPTY_FILTERS)).toHaveLength(CATALOG.length);
  });

  it("narrows to one shape family", () => {
    const out = applyFilters(CATALOG, { ...EMPTY_FILTERS, shapes: ["panto"] });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((f) => f.shape === "panto")).toBe(true);
  });

  it("searches the words, not only the codes", () => {
    const out = applyFilters(CATALOG, { ...EMPTY_FILTERS, query: "тортилл" });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((f) => /тортилл/iu.test(`${f.name} ${f.colorRu} ${f.sku}`))).toBe(true);
  });

  it("applies a front width window", () => {
    const out = applyFilters(CATALOG, { ...EMPTY_FILTERS, minFront: 140, maxFront: 150 });
    expect(out.every((f) => totalFrontWidthMm(f) >= 140 && totalFrontWidthMm(f) <= 150)).toBe(true);
  });

  it("sorts closest to the measured face first", () => {
    const ranked = sortByFit(CATALOG, head);
    const deltas = ranked.map((f) => Math.abs(totalFrontWidthMm(f) - 150));
    expect(deltas[0]).toBeLessThanOrEqual(deltas[deltas.length - 1]);
    expect(deltas).toEqual([...deltas].sort((a, b) => a - b));
  });

  it("sorts alphabetically by shape when there are no measurements", () => {
    const ranked = sortByFit(CATALOG, null);
    expect(ranked[0].shape).toBe("aviator");
  });

  it("counts facets for the filter rail", () => {
    const f = facets(CATALOG);
    expect(f.shapes).toHaveLength(7);
    expect(f.shapes.reduce((a, [, n]) => a + n, 0)).toBe(CATALOG.length);
  });
});

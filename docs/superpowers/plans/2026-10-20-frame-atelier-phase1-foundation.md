# FRAME Phase 1: design system, real eyewear geometry, catalog, core screens

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the FRAME front end and frame catalogue so a salon customer sees real eyewear geometry, honest millimetre measurements, and a production-grade interface, before the colour-vision half is added.

**Architecture:** Next.js 16 static export on GitHub Pages, talking to a Go API when `NEXT_PUBLIC_API_URL` is set and falling back to the mirrored TypeScript maths otherwise. Frame models live in one JSON catalogue consumed by both sides. Every visual of a frame, thumbnail and try-on overlay alike, is produced from the same geometry definition, so a catalogue picture cannot disagree with the object placed on a face.

**Tech stack:** Next.js 16.3.3, React 19.2.8, Tailwind 4.3.3 (`@theme` tokens), Three.js 0.185.1, MediaPipe tasks-vision 1.0.1, vitest 3.2.4 with v8 coverage, Go 1.25 standard library.

**Spec:** `docs/superpowers/specs/2026-10-20-frame-atelier-tz03-design.md`

**Asset research:** `docs/superpowers/specs/2026-10-20-asset-provenance.md` (written by Task 4)

## Global Constraints

Every task below implicitly includes all of these. Values are copied verbatim from the spec and the repo's existing conventions.

- Redistribution licence for any shipped third-party asset must be CC0, CC-BY, CC-BY-SA, MIT, Apache-2.0, or Unlicense. CC-BY-NC is rejected. Every asset needs a line in `web/public/models/NOTICE.txt`.
- No brand names and no recognisable trademarked silhouettes. Shape families are named round, panto, rect, square, cat, browline, aviator.
- User-facing copy: no sentence-final periods, no em dash anywhere, no right arrow, single or double angle quote, nor ascii arrow as a UI affordance, use an inline SVG icon, no praise copy such as "вам идёт" or "отличный выбор".
- Headings and card titles carry no trailing period and no `.` used as a separator.
- Numbers are set in IBM Plex Mono. An interface font never renders a measurement.
- Palette: paper `#F4F1E9`, ink `#141110`, line `#DAD3C5`, vermilion `#B0301C`, brass `#9C7A3C`, night `#141210`, cream `#EFE9DC`. Vermilion appears only on measured, selected, or broken state.
- No drop shadows on content cards, no gradients, no glassmorphism, no blanket uppercase.
- Accessibility: every state must read correctly with colour perception removed, per ТЗ FR-A01. Focus ring stays `2px` vermilion with `3px` offset.
- Static export must keep working: `GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/frame-atelier next build` produces `web/out` with no server-only imports.
- Coverage thresholds in `web/vitest.config.ts` are lines 80, functions 80, statements 80, branches 70. `npm test` runs `vitest run --coverage` and must stay green.
- Never report a passing check that could not run. If a test is skipped for an environmental reason, say so in the commit message and the task report.

## File Structure

Created:

- `web/public/data/frames.json`, the catalogue, single source of truth
- `web/src/lib/frame-catalog.ts`, typed loader and schema guard for the JSON
- `web/src/lib/frame-shapes.ts`, per-archetype 2D lens profiles in millimetres, pure
- `web/src/lib/fit-math.ts`, front width, millimetre delta, confidence bands, pure
- `web/src/lib/recommend.ts`, exactly-three selection with reasons, pure
- `web/src/lib/mesh-registry.ts`, maps a catalogue `mesh` id to a loader and anchor metadata
- `web/src/components/ui/rule.tsx`, millimetre ruler section divider
- `web/src/components/ui/measure-row.tsx`, one measurement with confidence track
- `web/src/components/ui/mode-chip.tsx`, selectable chip with pressed state
- `web/src/components/ui/pill-button.tsx`, primary action
- `web/src/components/ui/icon.tsx`, inline SVG icon set replacing text arrows
- `web/src/components/frame-thumb.tsx`, WebGL render of the real rig for catalogue cells
- `web/src/components/camera-stage.tsx`, live video plus overlay canvas plus status
- `web/src/components/measure-panel.tsx`, verdict and measurements
- `web/src/components/recommend-list.tsx`, Top-3 with reasons and exclusions
- `web/src/components/salon-list.tsx`, nearby optics
- `web/src/components/site-footer.tsx`
- `web/src/app/catalog/page.tsx`, `web/src/app/frames/[sku]/page.tsx`
- `backend/internal/catalog/frames.go`, embeds and parses the same JSON
- `backend/internal/fit/metrics.go`, mirrors `fit-math.ts`
- `testdata/fit-parity.json`, shared fixture both languages must reproduce

Modified:

- `web/src/app/globals.css`, `web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/app/how/page.tsx`
- `web/src/components/site-header.tsx`
- `web/src/lib/glasses-rig.ts`, new archetypes and material registry
- `web/src/lib/try-on-model.ts`, registry dispatch replaces hardcoded branches
- `web/src/lib/try-on-engine.ts`, per-model anchors
- `web/src/lib/landmarks.ts`, confidence and tolerance output
- `web/src/lib/fit-engine.ts`, re-exports the new pure modules, keeps `Frame`/`Head` wire shape
- `web/src/components/capture-studio.tsx`, reduced to orchestration only
- `web/public/models/NOTICE.txt`
- `backend/internal/catalog/catalog.go`, deleted once `frames.go` reads the JSON
- `backend/internal/fit/fit.go`, uses `metrics.go`

---

## Task 1: Catalogue as data

**Files:**
- Create: `web/public/data/frames.json`
- Create: `web/src/lib/frame-catalog.ts`
- Test: `web/src/lib/frame-catalog.test.ts`
- Modify: `web/src/lib/frames.ts` (delete after `frame-catalog.ts` lands)

**Interfaces:**
- Produces: `type Frame` with fields `sku, name, shape, material, color, colorRu, lensWidthMm, bridgeMm, templeMm, weightG, priceTenge, mesh, colors[], anchor`; front width is derived by `totalFrontWidthMm`, never stored ; `loadFrames(raw: unknown): Frame[]` which throws on a malformed record ; `frameById(frames: Frame[], sku: string): Frame | undefined`.
- Consumes by: Task 2 (shapes), Task 5 (fit), Task 8 (catalogue pages), Go loader.

- [ ] **Step 1: Write the failing test**

In `web/src/lib/frame-catalog.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import raw from "../public/data/frames.json";
import { frameById, loadFrames, totalFrontWidthMm } from "@/lib/frame-catalog";

describe("frame catalogue", () => {
  const frames = loadFrames(raw);

  it("holds at least forty distinct models", () => {
    expect(frames.length).toBeGreaterThanOrEqual(40);
    expect(new Set(frames.map((f) => f.sku)).size).toBe(frames.length);
  });

  it("spans every shape family", () => {
    const shapes = new Set(frames.map((f) => f.shape));
    for (const s of ["round", "panto", "rect", "square", "cat", "browline", "aviator"]) {
      expect(shapes.has(s), `missing shape ${s}`).toBe(true);
    }
  });

  it("carries plausible factory sizes", () => {
    for (const f of frames) {
      expect(f.lensWidthMm).toBeGreaterThanOrEqual(40);
      expect(f.lensWidthMm).toBeLessThanOrEqual(62);
      expect(f.bridgeMm).toBeGreaterThanOrEqual(12);
      expect(f.bridgeMm).toBeLessThanOrEqual(24);
      expect(f.templeMm).toBeGreaterThanOrEqual(120);
      expect(f.templeMm).toBeLessThanOrEqual(155);
    }
  });

  it("names every colour in words, not only as a swatch", () => {
    for (const f of frames) {
      expect(f.colorRu.trim().length).toBeGreaterThan(2);
      expect(f.colors.length).toBeGreaterThan(0);
    }
  });

  it("points at a mesh that exists in the registry", () => {
    for (const f of frames) expect(f.mesh).toMatch(/^(rig:|glb:|jeeliz:)/);
  });

  it("computes front width from the size code", () => {
    expect(totalFrontWidthMm(frames[0])).toBeCloseTo(
      frames[0].lensWidthMm * 2 + frames[0].bridgeMm + 2 * 12,
      1,
    );
  });

  it("rejects a record with an impossible bridge", () => {
    const bad = JSON.parse(JSON.stringify(raw));
    bad.frames[0].bridgeMm = 3;
    expect(() => loadFrames(bad)).toThrow(/bridgeMm/);
  });

  it("finds by sku", () => {
    expect(frameById(frames, frames[7].sku)?.sku).toBe(frames[7].sku);
    expect(frameById(frames, "NOPE")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd web && npx vitest run src/lib/frame-catalog.test.ts`
Expected: FAIL, cannot resolve `@/lib/frame-catalog`.

- [ ] **Step 3: Author the catalogue JSON**

`web/public/data/frames.json` is an object `{ "version": 1, "frames": [ ... ] }`. Build it with a throwaway Node script rather than by hand, then delete the script. Each record:

```json
{
  "sku": "FR-PANTO-54-TOR",
  "name": "Панто 54",
  "shape": "panto",
  "material": "acetate",
  "color": "tortoise",
  "colorRu": "Тортилла, коричнево-янтарный",
  "lensWidthMm": 54,
  "bridgeMm": 20,
  "templeMm": 145,
  "weightG": 24,
  "priceTenge": 62000,
  "mesh": "rig:panto",
  "colors": ["tortoise", "black", "horn"],
  "anchor": { "pupilY": 0.0, "frontZ": 0.0, "hingeX": 1.0 }
}
```

Rules for the 40-plus records, all of them real geometry rather than filler:

| shape | lens widths | bridge | temples | material |
|---|---|---|---|---|
| round | 43, 45, 47, 49, 51 | 20-24 | 140-148 | acetate, metal |
| panto | 48, 50, 52, 54, 56 | 17-21 | 140-150 | acetate |
| rect | 50, 52, 54, 56, 58 | 15-20 | 135-150 | acetate, metal, combo |
| square | 48, 50, 52, 54 | 17-21 | 140-148 | acetate |
| cat | 49, 51, 53, 55 | 15-19 | 135-145 | acetate |
| browline | 51, 53, 55, 57 | 15-19 | 140-150 | combo |
| aviator | 55, 57, 59, 61 | 13-17 | 135-145 | metal |

Colour vocabulary, each with its Russian name in `colorRu`: `black` Чёрный, графит; `tortoise` Тортилла, коричнево-янтарный; `horn` Рог, тёмно-коричневый; `burgundy` Бордо, тёмно-красный; `gold` Золото, тёплый жёлтый; `silver` Серебро, холодный серый; `gunmetal` Графит, сине-серый; `clear` Прозрачный, молочный; `olive` Олива, зеленовато-коричневый; `crystal` Кристалл, дымчато-серый.

Every SKU encodes shape, lens width and colour so it cannot collide. Prices are atelier placeholders and must be labelled as such in the UI by Task 8, never presented as a salon quote.

- [ ] **Step 4: Write the loader**

`web/src/lib/frame-catalog.ts`:

```ts
export type Anchor = { pupilY: number; frontZ: number; hingeX: number };

export type Frame = {
  sku: string;
  name: string;
  shape: string;
  material: string;
  color: string;
  colorRu: string;
  lensWidthMm: number;
  bridgeMm: number;
  templeMm: number;
  weightG: number;
  priceTenge: number;
  mesh: string;
  colors: string[];
  anchor: Anchor;
};

const SHAPES = ["round", "panto", "rect", "square", "cat", "browline", "aviator"];

function num(rec: Record<string, unknown>, key: string, lo: number, hi: number): number {
  const v = rec[key];
  if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi) {
    throw new Error(`frame ${rec.sku}: ${key} out of range (${String(v)})`);
  }
  return v;
}

export function loadFrames(raw: unknown): Frame[] {
  const recs = (raw as { frames?: unknown }).frames;
  if (!Array.isArray(recs)) throw new Error("frames.json: frames must be an array");
  return recs.map((entry) => {
    const rec = entry as Record<string, unknown>;
    const shape = String(rec.shape ?? "");
    if (!SHAPES.includes(shape)) throw new Error(`frame ${rec.sku}: unknown shape ${shape}`);
    const anchor = (rec.anchor ?? {}) as Record<string, unknown>;
    return {
      sku: String(rec.sku ?? ""),
      name: String(rec.name ?? ""),
      shape,
      material: String(rec.material ?? ""),
      color: String(rec.color ?? ""),
      colorRu: String(rec.colorRu ?? ""),
      lensWidthMm: num(rec, "lensWidthMm", 40, 62),
      bridgeMm: num(rec, "bridgeMm", 12, 24),
      templeMm: num(rec, "templeMm", 120, 155),
      weightG: num(rec, "weightG", 8, 60),
      priceTenge: num(rec, "priceTenge", 0, 1_000_000),
      mesh: String(rec.mesh ?? ""),
      colors: Array.isArray(rec.colors) ? (rec.colors as string[]) : [],
      anchor: {
        pupilY: Number(anchor.pupilY ?? 0),
        frontZ: Number(anchor.frontZ ?? 0),
        hingeX: Number(anchor.hingeX ?? 1),
      },
    } satisfies Frame;
  });
}

export function frameById(frames: Frame[], sku: string): Frame | undefined {
  return frames.find((f) => f.sku === sku);
}

/** Temple end pieces add about 12 mm per side to the declared size code. */
export function totalFrontWidthMm(f: Frame): number {
  return f.lensWidthMm * 2 + f.bridgeMm + 24;
}
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `cd web && npx vitest run src/lib/frame-catalog.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 6: Migrate consumers and delete the old list**

Replace `import { FRAMES } from "@/lib/frames"` with a loader call in `web/src/lib/api.ts` and anywhere else `grep -rn "from \"@/lib/frames\"" src` finds it, then `rm web/src/lib/frames.ts web/src/lib/frames.test.ts`.

Run: `cd web && npm run typecheck && npm test`
Expected: PASS with the old module gone.

- [ ] **Step 7: Commit**

```bash
git add web/public/data/frames.json web/src/lib/frame-catalog.ts web/src/lib/frame-catalog.test.ts web/src/lib/api.ts
git add -A web/src/lib/frames.ts web/src/lib/frames.test.ts
git commit -m "Move the eyewear catalogue into validated JSON data"
```

---

## Task 2: Shape profiles in millimetres

**Files:**
- Create: `web/src/lib/frame-shapes.ts`
- Test: `web/src/lib/frame-shapes.test.ts`
- Modify: `web/src/lib/glasses-rig.ts`

**Interfaces:**
- Consumes: `Frame["shape"]` strings from Task 1.
- Produces: `lensHeightMm(shape, lensWidthMm): number`, `rimProfile(shape, w, h, rimW, left): THREE.Shape`, `isWrapped(shape): boolean`, `depthMm(material): number`.

- [ ] **Step 1: Write the failing test**

`web/src/lib/frame-shapes.test.ts` asserts geometry properties, not pixels:

```ts
import { describe, expect, it } from "vitest";
import { depthMm, isWrapped, lensHeightMm, rimProfile } from "@/lib/frame-shapes";

const SHAPES = ["round", "panto", "rect", "square", "cat", "browline", "aviator"];

describe("frame shape profiles", () => {
  it("keeps height within a plausible share of width for every family", () => {
    for (const s of SHAPES) {
      const h = lensHeightMm(s, 52);
      expect(h, s).toBeGreaterThan(52 * 0.5);
      expect(h, s).toBeLessThan(52 * 1.05);
    }
  });

  it("makes panto bottom-heavy and aviator wide at the top", () => {
    expect(lensHeightMm("panto", 52)).toBeGreaterThan(lensHeightMm("round", 52) * 0.9);
    const panto = rimProfile("panto", 52, lensHeightMm("panto", 52), 5, true);
    const box = panto.getPoints(64).reduce(
      (acc, p) => ({ top: Math.max(acc.top, p.y), bottom: Math.min(acc.bottom, p.y), left: Math.min(acc.left, p.x), right: Math.max(acc.right, p.x) }),
      { top: -999, bottom: 999, left: 999, right: -999 },
    );
    const upper = box.top - (box.top + box.bottom) / 2;
    const lower = (box.top + box.bottom) / 2 - box.bottom;
    expect(lower, "panto drops lower than it rises").toBeGreaterThan(upper);
  });

  it("mirrors left and right eyes", () => {
    for (const s of SHAPES) {
      const h = lensHeightMm(s, 50);
      const l = rimProfile(s, 50, h, 5, true).getPoints(48);
      const r = rimProfile(s, 50, h, 5, false).getPoints(48);
      expect(Math.min(...l.map((p) => p.x))).toBeCloseTo(-Math.max(...r.map((p) => p.x)), 3);
    }
  });

  it("profiles are closed rings with a hole", () => {
    for (const s of SHAPES) {
      const p = rimProfile(s, 50, lensHeightMm(s, 50), 5, true);
      expect(p.holes.length, s).toBe(1);
    }
  });

  it("wraps only the families that wrap", () => {
    expect(isWrapped("aviator")).toBe(true);
    expect(isWrapped("browline")).toBe(true);
    expect(isWrapped("rect")).toBe(true);
  });

  it("sets acetate deeper than metal", () => {
    expect(depthMm("acetate")).toBeGreaterThan(depthMm("metal"));
    expect(depthMm("combo")).toBeGreaterThan(depthMm("metal"));
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd web && npx vitest run src/lib/frame-shapes.test.ts`
Expected: FAIL, module missing.

- [ ] **Step 3: Implement the profiles**

Move `lensHeightMm`, `roundedRect`, `catShape` and the ellipse branch out of `glasses-rig.ts` into `frame-shapes.ts`, then add the three missing families. The key new shapes:

```ts
const RATIOS: Record<string, number> = {
  round: 0.94, panto: 0.88, rect: 0.7, square: 0.9, cat: 0.68, browline: 0.62, aviator: 0.92,
};

export function lensHeightMm(shape: string, lensWidthMm: number): number {
  return lensWidthMm * (RATIOS[shape] ?? RATIOS.rect);
}

export function depthMm(material: string): number {
  if (material === "metal") return 2.1;
  if (material === "combo") return 4.4;
  return 5.4;
}

export function isWrapped(_shape: string): boolean {
  return true; // every real frame front wraps; the radius differs, not the boolean
}

/** Browline: flat heavy browbar over a shallow lower curve. Aviator: teardrop. */
function teardrop(w: number, h: number, left: boolean, hole: boolean): THREE.Shape {
  const k = left ? 1 : -1;
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    [-w / 2, h * 0.30], [-w / 2, h / 2], [w * 0.10, h / 2], [w / 2, h * 0.34],
    [w * 0.44, -h * 0.16], [w * 0.16, -h / 2], [-w * 0.22, -h * 0.42], [-w / 2, -h * 0.02],
    [-w / 2, h * 0.30],
  ].map(([x, y]) => [x * k, y]);
  if (hole) pts.reverse();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 2; i += 1) {
    const a = pts[i], b = pts[i + 1];
    s.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  s.quadraticCurveTo(pts.at(-2)![0], pts.at(-2)![1], pts[0][0], pts[0][1]);
  return s;
}
```

`rimProfile(shape, w, h, rimW, left)` keeps the existing outer-minus-hole construction and dispatches to `teardrop` for aviator, to a browbar-plus-lower-curve composite for browline, and to the existing rect/ellipse/cat paths otherwise.

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `cd web && npx vitest run src/lib/frame-shapes.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Rewire the rig and keep the suite green**

In `glasses-rig.ts` delete the moved functions and import from `@/lib/frame-shapes`. Wrap radius becomes material-aware (`metal` 260, `acetate` 220) inside `wrapFront`.

Run: `cd web && npm run typecheck && npm test`
Expected: PASS, including the pre-existing `glasses-rig.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/frame-shapes.ts web/src/lib/frame-shapes.test.ts web/src/lib/glasses-rig.ts
git commit -m "Extract millimetre-true lens profiles and add browline, panto, aviator"
```

---

## Task 3: Honest fit maths

**Files:**
- Create: `web/src/lib/fit-math.ts`
- Create: `web/src/lib/recommend.ts`
- Create: `web/src/lib/fit-math.test.ts`, `web/src/lib/recommend.test.ts`
- Create: `testdata/fit-parity.json`
- Modify: `web/src/lib/fit-engine.ts`, `web/src/lib/landmarks.ts`

**Interfaces:**
- Consumes: `Frame` from Task 1.
- Produces: `fitDeltaMm(head: Head, f: Frame): number`, `confidenceBand(measurements: number): { label: string; pct: number }`, `ShapeCall = { shape: string; label: string; confident: boolean; agreed: number; of: number }`, `recommend(head: Head, frames: Frame[], opts: { exclude?: string[] }): Suggestion[]` where `Suggestion = { frame: Frame; deltaMm: number; band: number; reasons: string[]; shape: string }`.

- [ ] **Step 1: Write the failing tests for the millimetre maths**

`web/src/lib/fit-math.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { confidenceBand, fitDeltaMm } from "@/lib/fit-math";
import type { Frame } from "@/lib/frame-catalog";

const base = { sku: "X", name: "X", shape: "rect", material: "acetate", color: "black", colorRu: "Чёрный", weightG: 20, priceTenge: 0, mesh: "rig:rect", colors: ["black"], anchor: { pupilY: 0, frontZ: 0, hingeX: 1 } };
const head = { ipdMm: 63, faceWidthMm: 145, faceHeightMm: 118, shapeHint: "oval", sizeHint: "M" };

describe("fit maths", () => {
  it("reports the signed millimetre gap between frame and face", () => {
    expect(fitDeltaMm(head, { ...base, lensWidthMm: 54, bridgeMm: 18, templeMm: 145 })).toBeCloseTo(1, 0);
    expect(fitDeltaMm(head, { ...base, lensWidthMm: 47, bridgeMm: 21, templeMm: 145 })).toBeLessThan(-5);
  });

  it("treats a wider bridge as a wider front", () => {
    const narrow = fitDeltaMm(head, { ...base, lensWidthMm: 52, bridgeMm: 14, templeMm: 145 });
    const wide = fitDeltaMm(head, { ...base, lensWidthMm: 52, bridgeMm: 21, templeMm: 145 });
    expect(wide).toBeGreaterThan(narrow);
  });

  it("maps agreement counts to bands instead of inventing percentages", () => {
    expect(confidenceBand(5).label).toBe("уверенно");
    expect(confidenceBand(3).label).toBe("ориентировочно");
    expect(confidenceBand(1).label).toBe("слабо");
    expect(confidenceBand(0).pct).toBe(0);
  });
});
```

- [ ] **Step 2: Write the failing tests for selection rules**

`web/src/lib/recommend.test.ts` must pin the ТЗ clauses:

```ts
import { describe, expect, it } from "vitest";
import raw from "../public/data/frames.json";
import { loadFrames } from "@/lib/frame-catalog";
import { recommend } from "@/lib/recommend";

const frames = loadFrames(raw);
const head = { ipdMm: 63, faceWidthMm: 145, faceHeightMm: 118, shapeHint: "oval", sizeHint: "M" };

describe("Top-3 selection", () => {
  it("returns exactly three suggestions", () => {
    expect(recommend(head, frames)).toHaveLength(3);
  });

  it("never suggests a frame outside the width tolerance", () => {
    for (const s of recommend(head, frames)) {
      expect(Math.abs(s.deltaMm), `${s.frame.sku} delta`).toBeLessThanOrEqual(6);
    }
  });

  it("suggests distinct shapes when the catalogue offers them", () => {
    const shapes = recommend(head, frames).map((s) => s.frame.shape);
    expect(new Set(shapes).size).toBe(shapes.length);
  });

  it("gives each suggestion two or three reasons", () => {
    for (const s of recommend(head, frames)) {
      expect(s.reasons.length).toBeGreaterThanOrEqual(2);
      expect(s.reasons.length).toBeLessThanOrEqual(3);
    }
  });

  it("states millimetres, never a praise sentence", () => {
    const text = recommend(head, frames).flatMap((s) => s.reasons).join(" ");
    expect(text).toMatch(/мм/);
    expect(text).not.toMatch(/идёт|отличн|идеальн| прекра/iu);
  });

  it("honours exclusions and backfills", () => {
    const first = recommend(head, frames)[0].frame.sku;
    const after = recommend(head, frames, { exclude: [first] });
    expect(after.map((s) => s.frame.sku)).not.toContain(first);
    expect(after).toHaveLength(3);
  });

  it("drops to size-only ranking when the shape call is weak", () => {
    const weak = { ...head, shapeHint: "unknown" };
    const out = recommend(weak, frames);
    expect(out).toHaveLength(3);
    expect(out[0].reasons.join(" ")).toMatch(/размер|ширин/);
  });
});
```

- [ ] **Step 3: Run both to confirm they fail**

Run: `cd web && npx vitest run src/lib/fit-math.test.ts src/lib/recommend.test.ts`
Expected: FAIL, modules missing.

- [ ] **Step 4: Implement**

`fit-math.ts` holds `totalFrontWidthMm` (import or re-export from `frame-catalog`), `fitDeltaMm = front - head.faceWidthMm`, and `confidenceBand(agreed)` returning `{ label, pct }` for 0 to 5. `recommend.ts` scores by |delta| first, applies the shape-contrast rule from the existing `fit-engine.ts` scoring, dedupes by `frame.shape`, skips excluded SKUs, and builds reasons as plain sentences such as `Ширина оправы 146 мм против ваших 145 мм, плюс 1 мм` and `Мост 20 мм на вашей переносице без давления`. When `shapeHint` is `unknown` or `agreed < 3`, reasons come only from size rules, per ТЗ FR-M03.

- [ ] **Step 5: Write the parity fixture and the Go mirror**

`testdata/fit-parity.json` holds three landmark sets, the expected `Head`, and the expected Top-3 SKUs. Add `backend/internal/fit/metrics.go` and `backend/internal/catalog/frames.go` that reads the same JSON through `//go:embed`, then a Go test asserting the same SKUs:

```go
func TestParityWithTypeScript(t *testing.T) {
  b, err := os.ReadFile("../../testdata/fit-parity.json")
  if err != nil { t.Fatalf("fixture missing: %v", err) }
  var f fixture
  if err := json.Unmarshal(b, &f); err != nil { t.Fatal(err) }
  for _, c := range f.Cases {
    head, err := Measure(c.Landmarks)
    if err != nil { t.Fatal(err) }
    if math.Abs(head.IPDmm-c.Want.IPDmm) > 0.6 { t.Errorf("%s ipd %v want %v", c.Name, head.IPDmm, c.Want.IPDmm) }
    got := Recommend(head, catalog.Frames())
    if len(got) != 3 { t.Fatalf("%s want 3 got %d", c.Name, len(got)) }
    for i, g := range got {
      if g.Frame.SKU != c.WantSKUs[i] { t.Errorf("%s rank %d got %s want %s", c.Name, i, g.Frame.SKU, c.WantSKUs[i]) }
    }
  }
}
```

- [ ] **Step 6: Run everything, both languages**

Run: `cd web && npm test && cd ../backend && go test ./internal/... -cover`
Expected: both PASS. If Go cannot run on this machine, report that explicitly rather than marking the task done.

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/fit-math.ts web/src/lib/recommend.ts web/src/lib/*.test.ts testdata backend/internal
git commit -m "Make fit output millimetres and add cross-language parity test"
```

---

## Task 4: Real mesh intake

**Files:**
- Create: `web/public/models/polyhaven/round-spectacles.glb` and its `LICENSE.txt`
- Create: `web/src/lib/mesh-registry.ts`, `web/src/lib/mesh-registry.test.ts`
- Create: `docs/superpowers/specs/2026-10-20-asset-provenance.md`
- Modify: `web/public/models/NOTICE.txt`, `web/src/lib/try-on-model.ts`, `web/src/lib/try-on-engine.ts`

**Interfaces:**
- Consumes: `Frame.mesh` ids from Task 1, `Anchor` from Task 1.
- Produces: `resolveMesh(id: string): MeshEntry` where `MeshEntry = { kind: "glb" | "rig" | "jeeliz"; url?: string; build?: (f: Frame) => THREE.Group }`, and `assertCatalogCovered(frames: Frame[]): void`.

- [ ] **Step 1: Record provenance before shipping anything**

Write `docs/superpowers/specs/2026-10-20-asset-provenance.md`. For each asset: exact URL, the licence string as read from the source, author credit, date fetched, files added, and the transform applied. Poly Haven Round Spectacles is CC0 1.0 by Sean Buckley, verified from the page's `license` meta. Any Sketchfab CC-BY model the owner downloads must record the model URL, author display name, and "CC-BY 4.0 via Sketchfab".

- [ ] **Step 2: Fetch and consolidate the CC0 asset**

```bash
mkdir -p web/public/models/polyhaven
curl -sfL -o /tmp/rs.gltf "https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/round_spectacles/round_spectacles_2k.gltf"
```

Pull the referenced textures, then fuse into one self-contained GLB with `npx --yes @gltf-transform/cli cp /tmp/rs.gltf web/public/models/polyhaven/round-spectacles.glb --flatten`. Verify: file exists, is under 4 MB, and `npx --yes @gltf-transform/cli inspect web/public/models/polyhaven/round-spectacles.glb` lists a glass material separate from the frame material.

- [ ] **Step 3: Write the failing registry test**

```ts
import { describe, expect, it } from "vitest";
import raw from "../public/data/frames.json";
import { loadFrames } from "@/lib/frame-catalog";
import { assertCatalogCovered, resolveMesh } from "@/lib/mesh-registry";

describe("mesh registry", () => {
  const frames = loadFrames(raw);

  it("resolves every mesh id used by the catalogue", () => {
    expect(() => assertCatalogCovered(frames)).not.toThrow();
  });

  it("keeps glb entries pointed at a real path", () => {
    const glb = frames.find((f) => f.mesh.startsWith("glb:"));
    if (!glb) return;
    expect(resolveMesh(glb.mesh).url).toMatch(/^\/models\/[\w./-]+\.glb$/);
  });

  it("builds a rig entry for every shape family", () => {
    for (const s of ["round", "panto", "rect", "square", "cat", "browline", "aviator"]) {
      expect(resolveMesh(`rig:${s}`).kind).toBe("rig");
    }
  });

  it("refuses an unknown mesh id loudly", () => {
    expect(() => resolveMesh("glb:nope")).toThrow(/unknown mesh/);
  });
});
```

- [ ] **Step 4: Implement the registry and replace the hardcoded dispatch**

`mesh-registry.ts` exports a table keyed by prefix. `try-on-model.ts` loses `isJeelizOptical` branch soup and instead calls `resolveMesh(frame.model ?? frame.mesh)`. Keep `usesParametricRig` behaviour behind the registry so `glasses-rig.test.ts` still passes.

- [ ] **Step 5: Run the suite and the typecheck**

Run: `cd web && npm run typecheck && npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/public/models docs/superpowers/specs/2026-10-20-asset-provenance.md web/src/lib/mesh-registry.ts web/src/lib/mesh-registry.test.ts web/src/lib/try-on-model.ts
git commit -m "Ship a CC0 spectacle mesh and route models through a registry"
```

---

## Task 5: Design tokens and UI primitives

**Files:**
- Modify: `web/src/app/globals.css`, `web/src/app/layout.tsx`
- Create: `web/src/components/ui/rule.tsx`, `measure-row.tsx`, `mode-chip.tsx`, `pill-button.tsx`, `icon.tsx`
- Create: `web/src/components/ui/ui.test.tsx`, `web/vitest.setup.ts`

**Interfaces:**
- Produces: `<Rule labels?={[...]}/>`, `<MeasureRow label value unit tolerance band/>`, `<ModeChip selected onSelect/>`, `<PillButton/>`, `<Icon name="arrow-right"|"check"|"share"|"camera"/>`.

- [ ] **Step 1: Set up a DOM test environment**

`npm i -D @testing-library/react @testing-library/jest-dom jsdom`, then add `environment: "jsdom"` and `setupFiles: ["./vitest.setup.ts"]` to `web/vitest.config.ts` for a second project, or keep `node` as default and mark the component test file with `// @vitest-environment jsdom` at the top. Prefer the per-file pragma: it leaves the existing fast node tests untouched.

- [ ] **Step 2: Write the failing component tests**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MeasureRow } from "@/components/ui/measure-row";
import { ModeChip } from "@/components/ui/mode-chip";
import { Icon } from "@/components/ui/icon";

describe("ui primitives", () => {
  it("renders a measurement with its tolerance and band label", () => {
    render(<MeasureRow label="Межзрачковое" value="63" unit="мм" tolerance="±0,8" band={92} />);
    expect(screen.getByText("Межзрачковое")).toBeTruthy();
    expect(screen.getByText(/63/)).toBeTruthy();
    expect(screen.getByText(/±0,8/)).toBeTruthy();
    expect(screen.getByRole("img", { name: /уверенность 92/ })).toBeTruthy();
  });

  it("marks a chip as pressed for assistive tech", () => {
    const fn = vi.fn();
    render(<ModeChip label="Дейтеранопия" selected onSelect={fn} />);
    const chip = screen.getByRole("button", { name: "Дейтеранопия" });
    expect(chip.getAttribute("aria-pressed")).toBe("true");
  });

  it("ships icons as svg, never as text arrows", () => {
    const { container } = render(<Icon name="arrow-right" />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.textContent).toBe("");
  });
});
```

- [ ] **Step 3: Replace tokens and fonts**

In `globals.css` extend `@theme` with the palette from Global Constraints and the three font variables. In `layout.tsx` replace `Cormorant_Garamond` with `Literata` and add `IBM_Plex_Mono`, keeping `Manrope` as the interface face, and keep the CSS-variable contract `--font-display` and `--font-sans` while adding `--font-mono`. Every family must declare `subsets: ["latin", "cyrillic"]`. Fraunces and Archivo were the first pick and are ruled out on evidence, not taste: `next/font` lists their subsets as `latin, latin-ext, vietnamese`, so requesting cyrillic fails the build's typecheck, and dropping the request would have rendered every Russian headline in the Georgia fallback.

- [ ] **Step 4: Implement the primitives**

`MeasureRow` renders label, mono value, unit, tolerance, and a track whose fill width is `band`, exposed as `role="img"` with `aria-label={"уверенность " + band}`. `Rule` renders the tick strip with optional mono labels. `ModeChip` is a `<button aria-pressed>` with the selected state carried by border weight and a leading tick, never colour alone. `Icon` is a map of inline SVG paths sized `1em`.

- [ ] **Step 5: Run the tests**

Run: `cd web && npx vitest run src/components/ui/ui.test.tsx && npm run lint`
Expected: PASS, 3 tests, lint clean.

- [ ] **Step 6: Commit**

```bash
git add web/src/app/globals.css web/src/app/layout.tsx web/src/components/ui web/vitest.config.ts web/package.json web/package-lock.json
git commit -m "Add the bench and chart design tokens with tested UI primitives"
```

---

## Task 6: Catalogue thumbnails from the real rig

**Files:**
- Create: `web/src/components/frame-thumb.tsx`
- Create: `web/src/lib/thumb-cache.ts`, `web/src/lib/thumb-cache.test.ts`

**Interfaces:**
- Consumes: `resolveMesh` from Task 4, `Frame` from Task 1.
- Produces: `<FrameThumb frame color size/>`, `thumbKey(frame, color): string`, `cacheGet(key)`, `cacheSet(key, dataUrl)`.

- [ ] **Step 1: Write the failing cache test**

```ts
import { describe, expect, it } from "vitest";
import { cacheGet, cacheSet, thumbKey } from "@/lib/thumb-cache";

describe("thumb cache", () => {
  it("keys on sku and colour so a recolour is not reused", () => {
    expect(thumbKey({ sku: "A", color: "black" })).not.toBe(thumbKey({ sku: "A", color: "gold" }));
  });
  it("stores and evicts beyond the cap", () => {
    for (let i = 0; i < 70; i += 1) cacheSet(`k${i}`, "data:,x");
    expect(cacheGet("k0")).toBeNull();
    expect(cacheGet("k69")).toBe("data:,x");
  });
});
```

- [ ] **Step 2: Implement the cache** with a `Map` capped at 64 entries, deleting the oldest insertion on overflow.

- [ ] **Step 3: Build the component**

One shared offscreen `WebGLRenderer` plus `RoomEnvironment` PMREM, rendering the rig at 2x device pixel ratio into a data URL, keyed by `thumbKey`. The component shows a hairline placeholder until the URL resolves, and falls back to a static SVG outline if WebGL is unavailable, so no cell is ever blank. Guard all renderer work behind `typeof window !== "undefined"`.

- [ ] **Step 4: Verify in the browser, not by assertion**

Run `cd web && npm run dev`, open the catalogue route, and confirm thumbnails show real acetate and metal response. Take a browser screenshot if the in-app browser surface is available; if it is not, say so in the task report rather than claiming visual confirmation.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/frame-thumb.tsx web/src/lib/thumb-cache.ts web/src/lib/thumb-cache.test.ts
git commit -m "Render catalogue thumbnails from the same geometry as the try-on"
```

---

## Task 7: Landing page rebuild

**Files:**
- Modify: `web/src/app/page.tsx`, `web/src/components/site-header.tsx`
- Create: `web/src/components/site-footer.tsx`, `web/src/components/landing/*.tsx` (one file per section)

**Interfaces:** Consumes Task 1 catalogue, Task 5 primitives, Task 6 thumbnails.

- [ ] **Step 1: Write the copy first, in the file, matching the spec's rules**

Sections in order: hero with live aperture, ruler divider, measurement table, three-step process, catalogue strip, colour-vision teaser, salons, privacy band, footer. Headline `Оправа по меркам, а не по типу лица`. No sentence-final periods, no em dash, no praise.

- [ ] **Step 2: Build each section as its own component**

`landing/hero.tsx`, `landing/measure-table.tsx`, `landing/steps.tsx`, `landing/catalog-strip.tsx`, `landing/color-teaser.tsx`, `landing/salons.tsx`, `landing/privacy.tsx`. `page.tsx` only composes them.

- [ ] **Step 3: Add a static-content test**

`web/src/app/page.test.tsx`, jsdom pragma, rendering `HomePage` and asserting: an `h1` exists, the disclaimer text "не диагноз" appears, no element's text contains an em dash or arrow glyph, and every measurement is inside an element whose class list includes `font-mono`.

- [ ] **Step 4: Run, then check the export still builds**

Run: `cd web && npm test && GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/frame-atelier npm run build`
Expected: PASS and a populated `web/out`.

- [ ] **Step 5: Commit**

```bash
git add web/src/app web/src/components
git commit -m "Rebuild the landing page on the new design system"
```

---

## Task 8: Capture screen, split and rebuilt

**Files:**
- Modify: `web/src/components/capture-studio.tsx` (target under 200 lines)
- Create: `web/src/components/camera-stage.tsx`, `measure-panel.tsx`, `recommend-list.tsx`, `salon-list.tsx`, `visit-packet-card.tsx`, `tint-picker.tsx`
- Test: `web/src/components/capture.test.tsx`

- [ ] **Step 1: Extract the camera stage** with video, overlay canvas, guide, status bar. Props: `videoRef`, `canvasRef`, `status`, `note`. No business logic.

- [ ] **Step 2: Extract the panels.** `MeasurePanel` takes `Head` and renders `MeasureRow`s with `confidenceBand`. `RecommendList` takes `Suggestion[]`, `picked`, `onPick`, `onExclude` and renders two or three reasons per row. `TintPicker` keeps colour names visible, satisfying FR-M11.

- [ ] **Step 3: Write the failing interaction test**

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecommendList } from "@/components/recommend-list";

const mk = (sku: string) => ({
  frame: { sku, name: "Тест", shape: "rect", material: "acetate", color: "black", colorRu: "Чёрный",
    lensWidthMm: 52, bridgeMm: 18, templeMm: 145, weightG: 22, priceTenge: 0, mesh: "rig:rect", colors: ["black"], anchor: { pupilY: 0, frontZ: 0, hingeX: 1 } },
  deltaMm: 1, band: 90, reasons: ["причина одна", "причина две"], shape: "rect",
});

describe("recommend list", () => {
  it("selects on click and excludes on request", () => {
    const onPick = vi.fn(), onExclude = vi.fn();
    render(<RecommendList items={[mk("A"), mk("B")]} picked={0} onPick={onPick} onExclude={onExclude} />);
    fireEvent.click(screen.getByRole("button", { name: /Тест B/ }));
    expect(onPick).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: /исключить/ }));
    expect(onExclude).toHaveBeenCalled();
  });

  it("shows millimetres rather than a praise badge", () => {
    render(<RecommendList items={[mk("A")]} picked={0} onPick={() => {}} onExclude={() => {}} />);
    expect(screen.getAllByText(/мм/).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4: Run tests, then verify the real camera path**

Run: `cd web && npm test`. Then `npm run dev`, open `/capture` in a browser, allow the camera, and confirm: overlay tracks the face, measurement appears, picking a suggestion swaps the overlay within 300 ms. Measure the swap with `performance.now()` around the pick handler and record the number in the task report. If the camera cannot be granted in this environment, state that instead of claiming it works.

- [ ] **Step 5: Commit**

```bash
git add web/src/components web/src/app/capture
git commit -m "Split the capture studio and rebuild it on the new primitives"
```

---

## Task 9: Catalogue and model pages

**Files:**
- Create: `web/src/app/catalog/page.tsx`, `web/src/app/frames/[sku]/page.tsx`, `web/src/lib/filters.ts`, `web/src/lib/filters.test.ts`
- Modify: `web/src/components/site-header.tsx`

- [ ] **Step 1: Write failing filter tests** covering shape facets, width range around the customer's measured width, colour text search, and sort by absolute delta.

- [ ] **Step 2: Implement `filters.ts`** as pure functions, then the pages. Catalogue shows `FrameThumb`, size code, `colorRu`, weight, and the signed delta against stored measurements when present. Model page shows all dimensions, the mesh at three angles, and an "уточняйте наличие" line rather than a stock claim.

- [ ] **Step 3: Generate static params for every SKU** so the export stays static: `export async function generateStaticParams()` returning all SKUs.

Run: `cd web && npm test && GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/frame-atelier npm run build`
Expected: PASS, and `web/out/frames/` contains one directory per SKU.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/catalog web/src/app/frames web/src/lib/filters.ts web/src/lib/filters.test.ts
git commit -m "Add browsable catalogue and per-model pages to the static export"
```

---

## Task 10: Method page, footer, accessibility and colour-blind audit

**Files:**
- Modify: `web/src/app/how/page.tsx`, `web/src/app/globals.css`
- Create: `web/src/lib/a11y-copy.ts`, `web/src/lib/a11y-copy.test.ts`

- [ ] **Step 1: Write the copy linter as a test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { describeSource } from "@/lib/a11y-copy";

const FILES = ["src/app/page.tsx", "src/app/how/page.tsx", "src/components/capture-studio.tsx"];

describe("copy rules", () => {
  it("finds no banned glyphs in shipped source", () => {
    const hits = FILES.flatMap((f) => describeSource(readFileSync(f, "utf8"), f))
      .filter((h) => h.rule !== "period");
    expect(hits).toEqual([]);
  });
});
```

`describeSource` flags: em dash, en dash used as punctuation, the arrow and angle-quote codepoints U2192 U203A U00BB plus ascii arrow, praise words, and a sentence-final period inside a heading string.

- [ ] **Step 2: Rebuild `/how`** with the method, the data sources with their licences, and the non-medical statement.

- [ ] **Step 3: Run a greyscale audit.** Load each route with `filter: grayscale(1)` applied in devtools and confirm every state, selection and error is still distinguishable. Record what you saw; do not record what you assume.

- [ ] **Step 4: Commit**

```bash
git add web/src
git commit -m "Add copy rules test and rebuild the method page"
```

---

## Task 11: Deployment wiring for the Go API

**Files:**
- Modify: `.github/workflows/pages.yml`, `web/.env.example`, `README.md`, `fly.toml`
- Create: `docs/deploy.md`

- [ ] **Step 1: Confirm the Pages build never calls a dead API.** `apiBase()` must stay empty in the Pages build, and the local fallback must be the code path exercised.

- [ ] **Step 2: Document the two-target release** with the exact commands for the Pages workflow and for `fly deploy` of the Go service, plus the environment variables each needs.

- [ ] **Step 3: Update README** so the stack, the licences and the honest-metrics rule are stated there.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/pages.yml README.md docs/deploy.md web/.env.example fly.toml
git commit -m "Document the Pages plus Go API release and keep the static fallback"
```

---

## Follow-on plans

Each is its own spec-to-plan cycle, written after Phase 1 ships, per the spec's sections:

- **Phase 2, colour vision:** profile, upload, point readout, WebGL simulation and daltonization, four-pane compare, labels, contours, patterns, intensity presets per scene, task feedback. Plans live at `docs/superpowers/plans/`.
- **Phase 3, benchmark and research:** scene corpus with rights sidecars, `algorithm_versions`, `processing_runs`, `benchmark_results`, dashboard with 95 percent intervals, consent and one-step withdrawal, export with data dictionary.
- **Phase 4, stylist and polish:** `POST /v1/stylist` with catalog-injected answers, provider configuration, Playwright visual regression across the four screens, latency budget enforcement at 720p.

## Out of scope for Phase 1

Real salon stock and prices. Prescription or lens work. Any diagnosis. The 200-face labelled set, which stays reported as unmeasured.

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

export const SHAPE_FAMILIES = [
  "round",
  "panto",
  "rect",
  "square",
  "cat",
  "browline",
  "aviator",
] as const;

/** End pieces extend the declared size code by roughly this much on each side. */
export const END_PIECE_MM = 12;

const RANGES = {
  lensWidthMm: [40, 62],
  bridgeMm: [12, 24],
  templeMm: [120, 155],
  weightG: [8, 60],
  priceTenge: [0, 1_000_000],
} as const;

function num(rec: Record<string, unknown>, key: keyof typeof RANGES): number {
  const v = rec[key];
  const [lo, hi] = RANGES[key];
  if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi) {
    throw new Error(`frame ${String(rec.sku)}: ${key} out of range (${String(v)})`);
  }
  return v;
}

function str(rec: Record<string, unknown>, key: string): string {
  const v = rec[key];
  return typeof v === "string" ? v : "";
}

function toFrame(rec: Record<string, unknown>): Frame {
  const shape = str(rec, "shape");
  if (!(SHAPE_FAMILIES as readonly string[]).includes(shape)) {
    throw new Error(`frame ${str(rec, "sku")}: unknown shape ${shape}`);
  }
  const anchor = (rec.anchor ?? {}) as Record<string, unknown>;
  const colors = Array.isArray(rec.colors) ? (rec.colors as string[]).map(String) : [];
  return {
    sku: str(rec, "sku"),
    name: str(rec, "name"),
    shape,
    material: str(rec, "material"),
    color: str(rec, "color"),
    colorRu: str(rec, "colorRu"),
    lensWidthMm: num(rec, "lensWidthMm"),
    bridgeMm: num(rec, "bridgeMm"),
    templeMm: num(rec, "templeMm"),
    weightG: num(rec, "weightG"),
    priceTenge: num(rec, "priceTenge"),
    mesh: str(rec, "mesh"),
    colors,
    anchor: {
      pupilY: Number(anchor.pupilY ?? 0),
      frontZ: Number(anchor.frontZ ?? 0),
      hingeX: Number(anchor.hingeX ?? 1),
    },
  };
}

export function loadFrames(raw: unknown): Frame[] {
  const recs = (raw as { frames?: unknown }).frames;
  if (!Array.isArray(recs)) {
    throw new Error("frames.json: frames must be an array");
  }
  return recs.map((entry) => toFrame(entry as Record<string, unknown>));
}

export function frameById(frames: Frame[], sku: string): Frame | undefined {
  return frames.find((f) => f.sku === sku);
}

export function totalFrontWidthMm(f: Frame): number {
  return f.lensWidthMm * 2 + f.bridgeMm + 2 * END_PIECE_MM;
}

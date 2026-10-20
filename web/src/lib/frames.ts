import raw from "../../public/data/frames.json";
import { loadFrames, type Frame } from "@/lib/frame-catalog";

export type { Frame };
export { loadFrames };

export const CATALOG: Frame[] = loadFrames(raw);

/** fit-engine still scores the wire shape the Go API returns. */
export type LegacyFrame = {
  sku: string;
  name: string;
  brand: string;
  shape: string;
  material: string;
  color: string;
  lensWidthMm: number;
  bridgeMm: number;
  templeMm: number;
  model?: string;
  colors?: string[];
};

export function toLegacyFrame(f: Frame): LegacyFrame {
  return {
    sku: f.sku,
    name: f.name,
    brand: "FRAME",
    shape: f.shape,
    material: f.material,
    color: f.color,
    lensWidthMm: f.lensWidthMm,
    bridgeMm: f.bridgeMm,
    templeMm: f.templeMm,
    model: f.mesh,
    colors: f.colors,
  };
}

export const LEGACY_FRAMES: LegacyFrame[] = CATALOG.map(toLegacyFrame);

export function silhouetteKey(frame: { shape: string; model?: string }): string {
  return frame.shape;
}

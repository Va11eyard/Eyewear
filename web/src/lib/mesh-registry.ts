import type { Frame } from "@/lib/frame-catalog";

export type MeshEntry = {
  kind: "rig" | "glb" | "jeeliz";
  /** Public path without the base path prefix. Absent for the parametric rig. */
  url?: string;
  /**
   * True when the renderer may recolour the mesh. A scanned or authored real
   * object carries its own material, so tinting it would misrepresent it.
   */
  tintable: boolean;
  license: string;
  credit: string;
  /** Front width measured from the source geometry, in millimetres. */
  frontWidthMm?: number;
};

const RIG_SHAPES = ["round", "panto", "rect", "square", "cat", "browline", "aviator"];

const MESHES: Record<string, MeshEntry> = {
  "glb:polyhaven-round": {
    kind: "glb",
    url: "/models/polyhaven/round-spectacles.glb",
    tintable: false,
    license: "CC0-1.0",
    credit: "Round Spectacles by Sean Buckley",
    frontWidthMm: 157.8,
  },
  "jeeliz:optical": {
    kind: "jeeliz",
    url: "/models/jeeliz/glassesFrames.json",
    tintable: true,
    license: "Apache-2.0",
    credit: "jeeliz/jeelizFaceFilter",
  },
};

export function resolveMesh(id: string): MeshEntry {
  if (id.startsWith("rig:")) {
    const shape = id.slice(4);
    if (!RIG_SHAPES.includes(shape)) {
      throw new Error(`unknown mesh ${id}`);
    }
    return {
      kind: "rig",
      tintable: true,
      license: "encumbered",
      credit: "FRAME parametric rig, built from the size code",
    };
  }
  const entry = MESHES[id];
  if (!entry) {
    throw new Error(`unknown mesh ${id}`);
  }
  return entry;
}

export function isTintable(frame: Pick<Frame, "mesh">): boolean {
  return resolveMesh(frame.mesh).tintable;
}

export function assertCatalogCovered(frames: Frame[]): void {
  if (frames.length === 0) {
    throw new Error("catalogue is empty");
  }
  for (const f of frames) {
    const entry = resolveMesh(f.mesh);
    if (entry.kind === "glb" || entry.kind === "jeeliz") {
      if (!entry.url) {
        throw new Error(`${f.sku}: mesh ${f.mesh} has no url`);
      }
      if (!entry.tintable && f.colors.length > 1) {
        throw new Error(`${f.sku}: ${f.mesh} carries its own material and must not offer tints`);
      }
    }
  }
}

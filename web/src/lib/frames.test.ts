import { describe, expect, it } from "vitest";
import { CATALOG, LEGACY_FRAMES, silhouetteKey, toLegacyFrame } from "./frames";

describe("catalogue bridge", () => {
  it("exposes every model to the scorer without losing the size code", () => {
    expect(LEGACY_FRAMES).toHaveLength(CATALOG.length);
    for (const f of CATALOG) {
      const legacy = toLegacyFrame(f);
      expect(legacy.model).toBe(f.mesh);
      expect(legacy.brand).toBe("FRAME");
      expect(`${legacy.lensWidthMm}-${legacy.bridgeMm}-${legacy.templeMm}`).toBe(
        `${f.lensWidthMm}-${f.bridgeMm}-${f.templeMm}`,
      );
    }
  });

  it("keeps mesh ids resolvable by the registry", () => {
    for (const f of CATALOG) {
      expect(f.mesh).toMatch(/^(rig:|glb:|jeeliz:)/);
    }
  });

  it("keys silhouettes on shape so recommendations cannot repeat a family", () => {
    expect(silhouetteKey({ shape: "browline" })).toBe("browline");
    const keys = new Set(CATALOG.map(silhouetteKey));
    expect(keys.size).toBeGreaterThan(5);
  });
});

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CATALOG } from "@/lib/frames";
import { assertCatalogCovered, isTintable, resolveMesh } from "@/lib/mesh-registry";

describe("mesh registry", () => {
  it("resolves every mesh id the catalogue uses", () => {
    expect(() => assertCatalogCovered(CATALOG)).not.toThrow();
  });

  it("builds a rig entry for every shape family", () => {
    for (const s of ["round", "panto", "rect", "square", "cat", "browline", "aviator"]) {
      expect(resolveMesh(`rig:${s}`).kind).toBe("rig");
    }
  });

  it("refuses an unknown mesh id rather than silently falling back", () => {
    expect(() => resolveMesh("glb:nope")).toThrow(/unknown mesh/);
    expect(() => resolveMesh("rig:hexagon")).toThrow(/unknown mesh/);
  });

  it("ships the real CC0 mesh at the path the registry claims", () => {
    const entry = resolveMesh("glb:polyhaven-round");
    const file = fileURLToPath(new URL(`../../public${entry.url}`, import.meta.url));
    expect(existsSync(file)).toBe(true);
    expect(entry.tintable).toBe(false);
  });

  it("records a licence for every third-party asset the app loads", () => {
    const notice = readFileSync(fileURLToPath(new URL("../../public/models/NOTICE.txt", import.meta.url)), "utf8");
    for (const id of ["glb:polyhaven-round", "jeeliz:optical"]) {
      const entry = resolveMesh(id);
      expect(notice, `${id} missing from NOTICE.txt`).toContain(entry.credit);
      expect(entry.license).toMatch(/CC0|Apache/);
    }
  });

  it("keeps the real object out of the tint picker", () => {
    const real = CATALOG.find((f) => f.mesh === "glb:polyhaven-round");
    const rig = CATALOG.find((f) => f.mesh.startsWith("rig:"));
    expect(isTintable(real ?? rig!)).toBe(false);
    expect(isTintable(rig!)).toBe(true);
  });
});

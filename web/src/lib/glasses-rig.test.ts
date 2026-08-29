import { describe, expect, it } from "vitest";
import { buildGlassesRig, eyeCenterX, lensHeightMm, rimWidthMm } from "./glasses-rig";

describe("glasses geometry", () => {
  it("uses factory eye size as the lens opening, not the outer rim", () => {
    expect(eyeCenterX(50, 20)).toBe(35);
    expect(rimWidthMm("acetate")).toBeGreaterThan(rimWidthMm("metal"));
    expect(lensHeightMm("round", 50)).toBeGreaterThan(lensHeightMm("rect", 50));
  });

  it("builds a hollow two-lens rig with temples", () => {
    const group = buildGlassesRig({
      shape: "rect",
      color: "black",
      material: "acetate",
      lensWidthMm: 50,
      bridgeMm: 20,
      templeMm: 145,
    });
    expect(group.children.length).toBeGreaterThanOrEqual(6);
  });

  it("adds nose pads on metal frames", () => {
    const metal = buildGlassesRig({
      shape: "round",
      color: "gold",
      material: "metal",
      lensWidthMm: 48,
      bridgeMm: 18,
      templeMm: 140,
    });
    expect(metal.children.length).toBeGreaterThan(
      buildGlassesRig({
        shape: "round",
        color: "black",
        material: "acetate",
        lensWidthMm: 48,
        bridgeMm: 18,
        templeMm: 140,
      }).children.length,
    );
  });

  it("covers cat, square and tortoise acetate", () => {
    const cat = buildGlassesRig({
      shape: "cat",
      color: "tortoise",
      material: "acetate",
      lensWidthMm: 52,
      bridgeMm: 18,
      templeMm: 140,
    });
    const square = buildGlassesRig({
      shape: "square",
      color: "horn",
      material: "acetate",
      lensWidthMm: 50,
      bridgeMm: 19,
      templeMm: 145,
    });
    expect(cat.children.length).toBeGreaterThan(5);
    expect(square.children.length).toBeGreaterThan(5);
    expect(lensHeightMm("oval", 50)).toBeLessThan(lensHeightMm("square", 50));
  });
});

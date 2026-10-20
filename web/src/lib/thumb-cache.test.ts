import { describe, expect, it } from "vitest";
import { cacheGet, cacheSet, cacheSize, thumbKey } from "@/lib/thumb-cache";

describe("thumb cache", () => {
  it("keys on sku and colour so a recolour is not reused", () => {
    expect(thumbKey({ sku: "A" }, "black")).not.toBe(thumbKey({ sku: "A" }, "gold"));
    expect(thumbKey({ sku: "A" }, "black")).toBe(thumbKey({ sku: "A", color: "black" }));
  });

  it("returns null for a miss rather than an undefined that renders a broken image", () => {
    expect(cacheGet("never-set")).toBeNull();
  });

  it("evicts the oldest entry beyond the cap", () => {
    for (let i = 0; i < 70; i += 1) {
      cacheSet(`k${i}`, "data:,x");
    }
    expect(cacheSize()).toBe(64);
    expect(cacheGet("k0")).toBeNull();
    expect(cacheGet("k69")).toBe("data:,x");
  });

  it("keeps a read entry alive through an eviction cycle", () => {
    cacheSet("hot", "data:,h");
    for (let i = 0; i < 40; i += 1) {
      cacheGet("hot");
      cacheSet(`n${i}`, "data:,x");
    }
    expect(cacheGet("hot")).toBe("data:,h");
  });
});

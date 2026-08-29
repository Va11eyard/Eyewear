import { describe, expect, it } from "vitest";
import { pxPerMm } from "./try-on-math";

describe("pxPerMm", () => {
  it("maps catalog front width to pixels", () => {
    expect(pxPerMm(122, 50, 22)).toBe(1);
  });

  it("rejects empty geometry", () => {
    expect(pxPerMm(100, 0, 0)).toBe(0);
    expect(pxPerMm(0, 50, 22)).toBe(0);
  });
});

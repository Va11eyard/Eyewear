import { afterEach, describe, expect, it, vi } from "vitest";
import { apiBase, getOptics, postFit } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiBase", () => {
  it("defaults to local go server", () => {
    expect(apiBase()).toContain("9000");
  });
});

describe("postFit", () => {
  it("returns head on 200", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      json: async () => ({ head: { ipdMm: 62 }, matches: [] }),
    }));
    const got = await postFit("data", []);
    expect(got.head.ipdMm).toBe(62);
  });

  it("throws mapped error", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: false,
      json: async () => ({ error: "no_face" }),
    }));
    await expect(postFit("data", [])).rejects.toThrow("no_face");
  });
});

describe("getOptics", () => {
  it("returns shops", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      json: async () => ({ shops: [{ id: 1, name: "Lens" }] }),
    }));
    const shops = await getOptics(1, 2);
    expect(shops[0]?.name).toBe("Lens");
  });

  it("rejects missing location errors", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: false,
      json: async () => ({ error: "invalid_location" }),
    }));
    await expect(getOptics(1, 2)).rejects.toThrow("invalid_location");
  });
});

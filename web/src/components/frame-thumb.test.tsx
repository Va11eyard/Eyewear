// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FrameThumb } from "@/components/frame-thumb";

const frame = {
  sku: "FR-PANTO-54-TORTOISE",
  shape: "panto",
  color: "tortoise",
  material: "acetate",
  lensWidthMm: 54,
  bridgeMm: 20,
  templeMm: 145,
  model: "rig:panto",
};

afterEach(cleanup);

describe("frame thumb", () => {
  it("keeps a readable size code as the placeholder when WebGL is absent", () => {
    render(<FrameThumb frame={frame} />);
    expect(screen.getByText("54-20-145")).toBeTruthy();
  });
});

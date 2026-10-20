// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Icon } from "@/components/ui/icon";
import { MeasureRow } from "@/components/ui/measure-row";
import { ModeChip } from "@/components/ui/mode-chip";
import { PillButton } from "@/components/ui/pill-button";
import { Rule } from "@/components/ui/rule";

afterEach(cleanup);

describe("ui primitives", () => {
  it("renders a measurement with its tolerance and band label", () => {
    render(<MeasureRow label="Межзрачковое" value="63" unit="мм" tolerance="±0,8" band={92} />);
    expect(screen.getByText("Межзрачковое")).toBeTruthy();
    expect(screen.getByText("63")).toBeTruthy();
    expect(screen.getByText("±0,8")).toBeTruthy();
    expect(screen.getByRole("img", { name: /уверенность 92/ })).toBeTruthy();
  });

  it("marks a chip as pressed for assistive tech and fires on click", () => {
    const onSelect = vi.fn();
    render(<ModeChip label="Дейтеранопия" selected onSelect={onSelect} />);
    const chip = screen.getByRole("button", { name: /Дейтеранопия/ });
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(chip);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("ships icons as svg, never as a text arrow", () => {
    const { container } = render(<Icon name="arrow-right" />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.textContent).toBe("");
  });

  it("keeps a disabled primary action out of the tab order of meaning", () => {
    render(<PillButton disabled>Открыть камеру</PillButton>);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders the ruler as decoration only", () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});

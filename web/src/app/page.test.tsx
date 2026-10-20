// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("landing", () => {
  const { container } = render(<HomePage />);
  const text = container.textContent ?? "";

  it("leads with the promise, not with praise", () => {
    const h1 = container.querySelector("h1");
    expect(h1?.textContent).toMatch(/меркам/);
    expect(h1?.textContent).toMatch(/не по типу лица/);
  });

  it("carries the non-medical statement in the page body", () => {
    expect(text).toMatch(/не диагноз/);
    expect(text).toMatch(/не сохраня/);
  });

  it("ships no banned glyphs and no sentence-final periods", () => {
    expect(text).not.toMatch(/—|–|→|›/);
    expect(text).not.toMatch(/[а-яё)\]]\.\s|[а-яё)\]]\.$/iu);
  });

  it("never presents example numbers as the visitor's own", () => {
    expect(text).toMatch(/демонстрационного расчёта/);
  });

  it("keeps every section heading free of a trailing period", () => {
    for (const h of container.querySelectorAll("h2, h3")) {
      expect((h.textContent ?? "").trim().endsWith(".")).toBe(false);
    }
  });
});

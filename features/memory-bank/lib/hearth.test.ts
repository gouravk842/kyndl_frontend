import { describe, expect, it } from "vitest";

import {
  bankStreakLine,
  bankWarmthShadow,
  flameCopy,
  HEARTH_BOARDS,
  youFlameClass,
} from "./hearth";

describe("hearth", () => {
  it("offers the three public boards", () => {
    expect(HEARTH_BOARDS.map((board) => board.id)).toEqual([
      "current",
      "longest",
      "week",
    ]);
    expect(HEARTH_BOARDS.map((board) => board.label)).toEqual([
      "Burning now",
      "Longest kept",
      "This week",
    ]);
  });

  it("describes a quiet day, a kept day, and an unlit flame", () => {
    expect(flameCopy("ember", 4, false).body).toMatch(/quiet day/i);
    expect(flameCopy("lit", 4, true).body).toMatch(/kept something today/i);
    expect(flameCopy("lit", 4, false).body).toMatch(/still up/i);
    expect(flameCopy("out", 0, false).title).toMatch(/out/i);
  });

  it("dims the personal flame on a quiet day and leaves it plain when it is out", () => {
    expect(youFlameClass("lit")).toContain("199,91,57");
    expect(youFlameClass("ember")).toContain("196,122,74");
    expect(youFlameClass("out")).not.toContain("199,91,57");
  });

  it("glows a tended bank and stays dark for the loose pile", () => {
    expect(bankWarmthShadow("out", 0)).toBeNull();
    expect(bankWarmthShadow("lit", 0)).toBeNull();
    const ember = bankWarmthShadow("ember", 3);
    const lit = bankWarmthShadow("lit", 12);
    expect(ember).toContain("196,122,74");
    expect(lit).toContain("199,91,57");
    expect(lit && ember && lit.length).toBeGreaterThan(ember.length);
    expect(
      bankStreakLine({ is_loose: true, streak: 4, warmth: "lit" }),
    ).toBeNull();
    expect(bankStreakLine({ streak: 4, warmth: "ember" })).toBe(
      "Quiet · 4 days",
    );
    expect(bankStreakLine({ streak: 1, warmth: "lit" })).toBe("1 day warm");
  });
});

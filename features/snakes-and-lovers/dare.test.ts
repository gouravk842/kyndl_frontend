import { describe, expect, it } from "vitest";

import type { Square } from "./config";
import { dareKey, dareSeconds, pickDare } from "./dare";

function square(
  partial: Partial<Square> & Pick<Square, "id" | "name" | "heat">,
): Square {
  return { note: "", ...partial };
}

describe("dareSeconds", () => {
  it("reads a duration from the how-to and ignores dares that have none", () => {
    expect(dareSeconds("Hold each other's eyes for 30 seconds.")).toBe(30);
    expect(dareSeconds("Make it last ten seconds.")).toBe(10);
    expect(dareSeconds("Massage their hands for a full minute.")).toBe(60);
    expect(dareSeconds("Two minutes of whatever they ask for.")).toBe(120);
    expect(
      dareSeconds("Put on one song and sway together till it ends."),
    ).toBeNull();
    expect(dareSeconds(undefined)).toBeNull();
  });
});

describe("pickDare", () => {
  const squares = [
    square({ id: 4, heat: "sweet", name: "Eye Gaze" }),
    square({ id: 8, heat: "sweet", name: "Slow Kiss" }),
    square({ id: 25, heat: "sweet", name: "Breather" }),
    square({ id: 40, heat: "flirty", name: "Lap Sit" }),
    square({ id: 100, heat: "wild", name: "Climax" }),
  ];

  it("shows the square's own dare the first time", () => {
    expect(pickDare(squares, 4, new Set())?.name).toBe("Eye Gaze");
  });

  it("picks another unused dare of the same heat after that one is done", () => {
    const used = new Set([dareKey(squares[0]!)]);
    expect(pickDare(squares, 4, used)?.name).toBe("Slow Kiss");
  });

  it("does not offer a safe square or the finale as a substitute", () => {
    const used = new Set([dareKey(squares[0]!), dareKey(squares[1]!)]);
    expect(pickDare(squares, 4, used)?.name).toBe("Lap Sit");
  });

  it("stays inside Sweet by offering the warmest dare that still fits", () => {
    const withWild = [
      ...squares,
      square({ id: 80, heat: "wild", name: "Wild One" }),
    ];
    expect(pickDare(withWild, 80, new Set(), "sweet")?.name).toBe("Lap Sit");
  });

  it("falls back to the square itself when every dare has been done", () => {
    const used = new Set(squares.map((square) => dareKey(square)));
    expect(pickDare(squares, 4, used)?.name).toBe("Eye Gaze");
  });
});

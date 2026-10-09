import { describe, expect, it } from "vitest";

import { rollDestination, rollPath } from "./move";

describe("rollPath", () => {
  it("matches the single-jump destination, including a bounce off 100", () => {
    for (let from = 0; from <= 99; from++) {
      for (let steps = 1; steps <= 6; steps++) {
        const travel = rollPath(from, steps);
        expect(travel.landed).toBe(rollDestination(from, steps));
        expect(travel.path).toHaveLength(steps);
        expect(travel.bounced).toBe(from + steps > 100);
        expect(Math.max(...travel.path)).toBeLessThanOrEqual(100);
        expect(Math.min(...travel.path)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("walks one square at a time, then back down after 100", () => {
    expect(rollPath(98, 4)).toEqual({
      path: [99, 100, 99, 98],
      landed: 98,
      bounced: true,
    });
    expect(rollPath(0, 3).path).toEqual([1, 2, 3]);
    expect(rollPath(97, 3).bounced).toBe(false);
  });
});

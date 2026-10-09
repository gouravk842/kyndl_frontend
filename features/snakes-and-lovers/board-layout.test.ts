import { describe, expect, it } from "vitest";

import {
  BOARD_LAYOUT_SOURCE,
  boardLayoutProblems,
  LADDERS,
  SNAKES,
} from "./board-layout";

describe("snakes & lovers board layout", () => {
  it("places a short, non-crossing board", () => {
    expect(boardLayoutProblems(LADDERS, SNAKES)).toEqual([]);
    expect(Object.keys(LADDERS)).toHaveLength(6);
    expect(Object.keys(SNAKES)).toHaveLength(6);
  });

  it("finds that board within the attempt budget", () => {
    expect(BOARD_LAYOUT_SOURCE).toBe("generated");
  });
});

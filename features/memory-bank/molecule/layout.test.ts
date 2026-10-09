import { describe, expect, it } from "vitest";

import { LATEST_R, layoutMolecule, NODE_R, sortNewestFirst } from "./layout";

const VIEW = { w: 800, h: 700 };

describe("sortNewestFirst", () => {
  it("puts the latest stamp first", () => {
    const sorted = sortNewestFirst([
      { id: "old", stamp: 1 },
      { id: "new", stamp: 9 },
      { id: "mid", stamp: 4 },
    ]);
    expect(sorted.map((row) => row.id)).toEqual(["new", "mid", "old"]);
  });
});

describe("layoutMolecule", () => {
  it("returns an empty field with no items", () => {
    const layout = layoutMolecule([], VIEW);
    expect(layout.nodes).toHaveLength(0);
    expect(layout.bonds).toHaveLength(0);
  });

  it("makes the newest node the head and larger", () => {
    const layout = layoutMolecule(
      [
        { id: "a", stamp: 100 },
        { id: "b", stamp: 300 },
        { id: "c", stamp: 200 },
      ],
      VIEW,
    );
    expect(layout.nodes[0]!.id).toBe("b");
    expect(layout.nodes[0]!.latest).toBe(true);
    expect(layout.nodes[0]!.r).toBe(LATEST_R);
    expect(layout.nodes[1]!.r).toBe(NODE_R);
    expect(layout.nodes.map((node) => node.id)).toEqual(["b", "c", "a"]);
  });

  it("walks downward through time and bonds neighbors", () => {
    const layout = layoutMolecule(
      [
        { id: "a", stamp: 1 },
        { id: "b", stamp: 2 },
        { id: "c", stamp: 3 },
      ],
      VIEW,
    );
    expect(layout.nodes[0]!.y).toBeLessThan(layout.nodes[1]!.y);
    expect(layout.nodes[1]!.y).toBeLessThan(layout.nodes[2]!.y);
    expect(layout.bonds).toHaveLength(2);
    expect(layout.bonds[0]).toMatchObject({ from: "c", to: "b" });
    expect(layout.height).toBeGreaterThan(layout.nodes[2]!.y);
  });
});

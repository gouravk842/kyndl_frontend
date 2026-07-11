/**
 * Completion + progress, for both modes.
 *
 *  - board-snap: done when every piece is locked into its slot. Progress is the
 *    fraction placed.
 *  - free-assemble: done when all pieces have fused into a single cluster.
 *    Progress is `(total − groups) / (total − 1)` — i.e. how many of the joins
 *    needed to reach one cluster have happened.
 */
import type { AssemblyMode, Placement } from "../types";

/** Fraction of the puzzle completed, 0..1. */
export function progress(
  mode: AssemblyMode,
  placements: Map<number, Placement>,
  groupCount: number,
): number {
  const total = placements.size;
  if (total === 0) return 0;

  if (mode === "board-snap") {
    let placed = 0;
    for (const p of placements.values()) if (p.placed) placed++;
    return placed / total;
  }

  // free-assemble: total−1 joins are needed to collapse to one cluster.
  if (total === 1) return 1;
  return (total - groupCount) / (total - 1);
}

/** Whether the puzzle is solved. */
export function isSolved(
  mode: AssemblyMode,
  placements: Map<number, Placement>,
  groupCount: number,
): boolean {
  if (placements.size === 0) return false;
  if (mode === "board-snap") {
    for (const p of placements.values()) if (!p.placed) return false;
    return true;
  }
  return groupCount === 1;
}

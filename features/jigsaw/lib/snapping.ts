/**
 * Snap detection — pure geometry, no state. The store drags a group, then asks
 * these helpers two questions on release:
 *
 *  - board-snap: is any member near its true slot? (`boardSnapDelta`)
 *  - free-assemble: is any member aligned with a neighbour from another group?
 *    (`peerSnapDelta`), and after nudging, which neighbours now touch?
 *    (`adjacentMerges`)
 *
 * A "delta" is the translation to apply to the whole moving group so it lands
 * cleanly. The store applies it, then merges/locks accordingly.
 */
import type { Piece, Vec2 } from "../types";

/** Default snap radius if a config omits one: a quarter of the smaller cell. */
export function defaultTolerance(cellW: number, cellH: number): number {
  return Math.min(cellW, cellH) * 0.25;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

/** Grid-neighbour piece id in a direction, or -1 if off the board. */
function neighborId(
  piece: Piece,
  dRow: number,
  dCol: number,
  rows: number,
  cols: number,
): number {
  const r = piece.row + dRow;
  const c = piece.col + dCol;
  if (r < 0 || c < 0 || r >= rows || c >= cols) return -1;
  return r * cols + c;
}

const NEIGHBORS: ReadonlyArray<[number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * board-snap: if any moving member sits within `tol` of its true slot, return
 * the delta that lands it exactly there (applied to the whole group). Picks the
 * closest member so a near-aligned cluster snaps as one.
 */
export function boardSnapDelta(
  movingIds: number[],
  pieces: Piece[],
  positions: Map<number, Vec2>,
  tol: number,
): Vec2 | null {
  let best: Vec2 | null = null;
  let bestDist = tol;
  for (const id of movingIds) {
    const piece = pieces[id]!;
    const pos = positions.get(id)!;
    const d = dist(pos.x, pos.y, piece.targetX, piece.targetY);
    if (d <= bestDist) {
      bestDist = d;
      best = { x: piece.targetX - pos.x, y: piece.targetY - pos.y };
    }
  }
  return best;
}

/**
 * free-assemble: if any moving member is within `tol` of its correct position
 * relative to a settled neighbour in another group, return the delta that aligns
 * them. The ideal offset between two pieces equals the difference of their slot
 * targets, so this works wherever the cluster currently floats.
 */
export function peerSnapDelta(
  movingIds: number[],
  pieces: Piece[],
  positions: Map<number, Vec2>,
  groupRootOf: (id: number) => number,
  rows: number,
  cols: number,
  tol: number,
): Vec2 | null {
  const moving = new Set(movingIds);
  let best: Vec2 | null = null;
  let bestDist = tol;

  for (const id of movingIds) {
    const piece = pieces[id]!;
    const pos = positions.get(id)!;
    for (const [dRow, dCol] of NEIGHBORS) {
      const nId = neighborId(piece, dRow, dCol, rows, cols);
      if (nId < 0 || moving.has(nId)) continue; // border or same cluster

      const other = pieces[nId]!;
      const otherPos = positions.get(nId)!;
      // Where `piece` should sit given `other` is fixed.
      const wantX = otherPos.x + (piece.targetX - other.targetX);
      const wantY = otherPos.y + (piece.targetY - other.targetY);
      const d = dist(pos.x, pos.y, wantX, wantY);
      if (d <= bestDist) {
        bestDist = d;
        best = { x: wantX - pos.x, y: wantY - pos.y };
      }
    }
  }
  return best;
}

/**
 * After a peer snap nudges the group into place, find every correct-neighbour
 * pair across the group boundary that now coincides within `eps`. The store
 * unions each pair so the clusters fuse. `eps` is tight — alignment already
 * happened, this only confirms which seams meet.
 */
export function adjacentMerges(
  movingIds: number[],
  pieces: Piece[],
  positions: Map<number, Vec2>,
  rows: number,
  cols: number,
  eps: number,
): Array<[number, number]> {
  const moving = new Set(movingIds);
  const merges: Array<[number, number]> = [];
  for (const id of movingIds) {
    const piece = pieces[id]!;
    const pos = positions.get(id)!;
    for (const [dRow, dCol] of NEIGHBORS) {
      const nId = neighborId(piece, dRow, dCol, rows, cols);
      if (nId < 0 || moving.has(nId)) continue;
      const other = pieces[nId]!;
      const otherPos = positions.get(nId)!;
      const wantX = otherPos.x + (piece.targetX - other.targetX);
      const wantY = otherPos.y + (piece.targetY - other.targetY);
      if (dist(pos.x, pos.y, wantX, wantY) <= eps) merges.push([id, nId]);
    }
  }
  return merges;
}

/**
 * Initial piece placement. Seeded so a puzzle always opens laid out the same
 * way — reproducible alongside the cut, but on its own RNG stream so the scatter
 * is independent of which edges became tabs.
 */
import type { JigsawConfig, Piece, Region, Vec2 } from "../types";
import { makeRng, seedFrom } from "./rng";

/** XORed into the seed so scatter and cut never share a sequence. */
const SCATTER_SALT = 0x9e3779b9;

/**
 * Scatter pieces randomly within `region` (board-pixel space). Positions are
 * bbox top-lefts, clamped so each piece stays fully inside the region. Used for
 * the tray in board-snap mode and for the open canvas in free-assemble mode.
 */
export function scatterPieces(
  config: JigsawConfig,
  pieces: Piece[],
  region: Region,
): Map<number, Vec2> {
  const base =
    config.seed ??
    seedFrom(`${config.image.src}:${config.grid.rows}x${config.grid.cols}`);
  const rng = makeRng((base ^ SCATTER_SALT) >>> 0);

  const out = new Map<number, Vec2>();
  // Visit in shuffled order so stacking (z by placement order) is varied.
  const order = [...pieces].sort(() => (rng.bool() ? 1 : -1));
  for (const piece of order) {
    const maxX = Math.max(region.x, region.x + region.w - piece.width);
    const maxY = Math.max(region.y, region.y + region.h - piece.height);
    out.set(piece.id, {
      x: rng.range(region.x, maxX),
      y: rng.range(region.y, maxY),
    });
  }
  return out;
}

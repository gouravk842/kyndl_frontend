/**
 * Pixel geometry for a puzzle. Pure: given a board size it derives cell sizes
 * and the uniform bbox margin (`tab`) that contains a piece's knobs. Recomputed
 * on resize — and because the cut is seeded elsewhere, recomputing never
 * changes *which* edges are tabs, only their scale.
 */
import type { JigsawConfig, Layout } from "../types";

/**
 * Knob peak as a fraction of the edge length. A symmetric cubic bulb peaks at
 * ~0.75·(control reach); with the reach used in `edges.ts` that lands near 0.3,
 * so a 0.34 margin always contains the tab with a hair of slack.
 */
export const TAB_MARGIN_RATIO = 0.34;

/**
 * Fit the image inside `boardW × boardH` (its own aspect wins, letterboxed by
 * the caller) and split it into a `rows × cols` grid. The board IS the drawn
 * image, so cells tile it exactly.
 */
export function buildLayout(
  config: JigsawConfig,
  boardW: number,
  boardH: number,
): Layout {
  const { rows, cols } = config.grid;
  const cellW = boardW / cols;
  const cellH = boardH / rows;
  // One uniform margin keeps every piece bbox the same size, which simplifies
  // rendering and the image-offset math. Size it to the larger cell axis so a
  // tab on either orientation always fits.
  const tab = TAB_MARGIN_RATIO * Math.max(cellW, cellH);
  return { rows, cols, boardW, boardH, cellW, cellH, tab };
}

/**
 * Fit an image of natural size `imgW × imgH` into an `available` box while
 * preserving aspect ratio. Returns the board (drawn image) size to feed
 * `buildLayout`. Keeps puzzles crisp and undistorted on any screen.
 */
export function fitBoard(
  imgW: number,
  imgH: number,
  availW: number,
  availH: number,
): { boardW: number; boardH: number } {
  const scale = Math.min(availW / imgW, availH / imgH);
  return { boardW: imgW * scale, boardH: imgH * scale };
}

/** Solved top-left of a piece's bounding box (core inset by the tab margin). */
export function targetPosition(
  layout: Layout,
  row: number,
  col: number,
): { x: number; y: number } {
  return {
    x: col * layout.cellW - layout.tab,
    y: row * layout.cellH - layout.tab,
  };
}

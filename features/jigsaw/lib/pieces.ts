/**
 * Assemble the full `Piece[]` for a puzzle: geometry (`geometry.ts`) + cut
 * (`edges.ts`) combined into render-ready data. Pure — given a layout and a
 * config it always returns the same pieces, so it can run on first mount and
 * again on every resize.
 */
import type { JigsawConfig, Layout, Piece } from "../types";
import { buildSeams, edgeTypesForPiece, piecePath } from "./edges";
import { targetPosition } from "./geometry";

/**
 * Build every piece for `layout`. Each piece shares a uniform bbox (cell + 2·tab
 * per axis); its slice of the image is positioned via a background offset, and
 * its shape is a CSS clip path in piece-local px.
 */
export function buildPieces(config: JigsawConfig, layout: Layout): Piece[] {
  const { rows, cols, cellW, cellH, tab } = layout;
  const seams = buildSeams(config);
  const style = config.edgeStyle ?? "classic";
  const width = cellW + tab * 2;
  const height = cellH + tab * 2;

  const pieces: Piece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const edges = edgeTypesForPiece(seams, row, col, rows, cols);
      const target = targetPosition(layout, row, col);
      pieces.push({
        id: row * cols + col,
        row,
        col,
        edges,
        width,
        height,
        path: piecePath(layout, seams, row, col, edges, style),
        // Place the full board-sized image so this piece's cell shows through.
        // bbox top-left sits at (col·cellW − tab); image origin must land there.
        imageOffsetX: tab - col * cellW,
        imageOffsetY: tab - row * cellH,
        targetX: target.x,
        targetY: target.y,
      });
    }
  }
  return pieces;
}

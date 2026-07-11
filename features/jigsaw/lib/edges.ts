/**
 * Piece cutting — the jigsaw "knob" algorithm.
 *
 * A **seam** is the boundary shared by two adjacent pieces. For each interior
 * seam we deterministically pick which side carries the tab (the other gets the
 * matching blank) plus a little shape jitter, all seeded so the cut is
 * reproducible. Both pieces read the *same* seam, and the knob is **symmetric
 * about the seam midpoint**, so the two edges trace the identical board-space
 * curve and interlock exactly — only the perpendicular sign differs.
 *
 * Paths are emitted in piece-local pixel space (origin = bbox top-left) and fed
 * straight to CSS `clip-path: path(...)`, so the renderer needs no SVG defs.
 */
import type {
  EdgeStyle,
  EdgeType,
  JigsawConfig,
  Layout,
  PieceEdges,
  Seam,
  Seams,
  Vec2,
} from "../types";
import { makeRng, seedFrom } from "./rng";

/** Bulb control reach (perp), as a fraction of edge length. Drives knob height. */
const BULB_MIN = 0.34;
const BULB_MAX = 0.42;
/** Neck half-width as a fraction of edge length. */
const NECK_MIN = 0.1;
const NECK_MAX = 0.13;
/** How far past the neck the bulb shoulders reach — this is what overhangs. */
const SHOULDER = 0.1;
/** "soft" style shrinks the knobs a touch for a gentler look. */
const SOFT_FACTOR = 0.82;

function makeSeam(rng: ReturnType<typeof makeRng>): Seam {
  return {
    flip: rng.bool(),
    neck: rng.range(NECK_MIN, NECK_MAX),
    bulb: rng.range(BULB_MIN, BULB_MAX),
  };
}

/**
 * Build every interior seam from the config's seed. Deterministic iteration
 * order means the same seed always produces the same cut.
 */
export function buildSeams(config: JigsawConfig): Seams {
  const { rows, cols } = config.grid;
  const seed = config.seed ?? seedFrom(`${config.image.src}:${rows}x${cols}`);
  const rng = makeRng(seed);

  // Vertical seams: between column c and c+1, one per row.
  const vertical: Seam[][] = [];
  for (let r = 0; r < rows; r++) {
    const line: Seam[] = [];
    for (let c = 0; c < cols - 1; c++) line.push(makeSeam(rng));
    vertical.push(line);
  }
  // Horizontal seams: between row r and r+1, one per column.
  const horizontal: Seam[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    const line: Seam[] = [];
    for (let c = 0; c < cols; c++) line.push(makeSeam(rng));
    horizontal.push(line);
  }
  return { vertical, horizontal };
}

/**
 * The four edge types for piece (row, col). Border edges are flat; interior
 * edges read their seam — `flip` decides which neighbour gets the tab.
 *
 * Convention: the lower-index piece (smaller row/col) carries the tab when
 * `flip` is true. The opposite piece always gets the mirror.
 */
export function edgeTypesForPiece(
  seams: Seams,
  row: number,
  col: number,
  rows: number,
  cols: number,
): PieceEdges {
  const top: EdgeType =
    row === 0
      ? "flat"
      : seams.horizontal[row - 1]![col]!.flip
        ? "blank" // the seam's tab went to the piece above
        : "tab";
  const bottom: EdgeType =
    row === rows - 1
      ? "flat"
      : seams.horizontal[row]![col]!.flip
        ? "tab"
        : "blank";
  const left: EdgeType =
    col === 0
      ? "flat"
      : seams.vertical[row]![col - 1]!.flip
        ? "blank" // the seam's tab went to the piece on the left
        : "tab";
  const right: EdgeType =
    col === cols - 1
      ? "flat"
      : seams.vertical[row]![col]!.flip
        ? "tab"
        : "blank";
  return { top, right, bottom, left };
}

/** The seam backing a given edge, or null for a flat border edge. */
function seamForEdge(
  seams: Seams,
  row: number,
  col: number,
  side: keyof PieceEdges,
  rows: number,
  cols: number,
): Seam | null {
  switch (side) {
    case "top":
      return row === 0 ? null : seams.horizontal[row - 1]![col]!;
    case "bottom":
      return row === rows - 1 ? null : seams.horizontal[row]![col]!;
    case "left":
      return col === 0 ? null : seams.vertical[row]![col - 1]!;
    case "right":
      return col === cols - 1 ? null : seams.vertical[row]![col]!;
  }
}

const f = (n: number) => n.toFixed(2);

/**
 * Append one edge to the path. `start` is the edge's first corner, `u` the unit
 * direction along it, `n` the outward unit normal, `len` its pixel length.
 *
 * `(a, w)` are fractions: `a` along the edge, `w` perpendicular (positive =
 * outward). A flat edge is one straight line; a tab/blank is line → bulb → line,
 * the bulb a single symmetric cubic whose shoulders reach past the neck to form
 * the interlocking overhang. `sp` flips the bulge for tab (+1) vs blank (−1).
 */
function appendEdge(
  cmds: string[],
  start: Vec2,
  u: Vec2,
  n: Vec2,
  len: number,
  type: EdgeType,
  seam: Seam | null,
  style: EdgeStyle,
): void {
  const at = (a: number, w: number) => ({
    x: start.x + u.x * a * len + n.x * w * len,
    y: start.y + u.y * a * len + n.y * w * len,
  });

  if (type === "flat" || !seam) {
    const e = at(1, 0);
    cmds.push(`L ${f(e.x)} ${f(e.y)}`);
    return;
  }

  const scale = style === "soft" ? SOFT_FACTOR : 1;
  const sp = type === "tab" ? 1 : -1;
  const neck = seam.neck;
  const bulb = seam.bulb * scale * sp;
  const shoulder = neck + SHOULDER;

  const b = at(0.5 - neck, 0);
  const c1 = at(0.5 - shoulder, bulb);
  const c2 = at(0.5 + shoulder, bulb);
  const d = at(0.5 + neck, 0);
  const e = at(1, 0);

  cmds.push(`L ${f(b.x)} ${f(b.y)}`);
  cmds.push(`C ${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(d.x)} ${f(d.y)}`);
  cmds.push(`L ${f(e.x)} ${f(e.y)}`);
}

/**
 * The closed clip path for one piece, in piece-local px. Walks the core square
 * clockwise (top → right → bottom → left), substituting each edge's knob.
 */
export function piecePath(
  layout: Layout,
  seams: Seams,
  row: number,
  col: number,
  edges: PieceEdges,
  style: EdgeStyle = "classic",
): string {
  const { cellW, cellH, tab, rows, cols } = layout;
  // Core square corners in local space (bbox inset by the tab margin).
  const tl = { x: tab, y: tab };
  const tr = { x: tab + cellW, y: tab };
  const br = { x: tab + cellW, y: tab + cellH };
  const bl = { x: tab, y: tab + cellH };

  const cmds = [`M ${f(tl.x)} ${f(tl.y)}`];
  const seam = (side: keyof PieceEdges) =>
    seamForEdge(seams, row, col, side, rows, cols);

  // top: left→right, outward = up
  appendEdge(cmds, tl, { x: 1, y: 0 }, { x: 0, y: -1 }, cellW, edges.top, seam("top"), style); // prettier-ignore
  // right: top→bottom, outward = right
  appendEdge(cmds, tr, { x: 0, y: 1 }, { x: 1, y: 0 }, cellH, edges.right, seam("right"), style); // prettier-ignore
  // bottom: right→left, outward = down
  appendEdge(cmds, br, { x: -1, y: 0 }, { x: 0, y: 1 }, cellW, edges.bottom, seam("bottom"), style); // prettier-ignore
  // left: bottom→top, outward = left
  appendEdge(cmds, bl, { x: 0, y: -1 }, { x: -1, y: 0 }, cellH, edges.left, seam("left"), style); // prettier-ignore

  cmds.push("Z");
  return cmds.join(" ");
}

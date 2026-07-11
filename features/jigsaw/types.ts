/**
 * Jigsaw engine — shared types.
 *
 * The engine is **headless and config-driven**: every consumer (the standalone
 * game page, a future Memory City gate, a gift "reveal" puzzle) hands it a
 * `JigsawConfig` and gets back the same data model. Nothing here knows about
 * Kyndl, React, or the DOM — the pure `lib/` functions and the store build on
 * these types alone (same engine/UI split as `features/ludo`).
 */

/** A 2D point in board-pixel space. */
export interface Vec2 {
  x: number;
  y: number;
}

/** A piece edge can sit flush with the image border, bulge out, or indent in. */
export type EdgeType = "flat" | "tab" | "blank";

/** The four edges of a piece, walking clockwise from the top. */
export interface PieceEdges {
  top: EdgeType;
  right: EdgeType;
  bottom: EdgeType;
  left: EdgeType;
}

/**
 * How pieces are allowed to come together:
 *  - `board-snap`   pieces drop into their true slot on a target outline.
 *  - `free-assemble` pieces clip onto each other anywhere (classic jigsaw).
 *
 * The engine supports both from day one; a consumer picks per `JigsawConfig`.
 */
export type AssemblyMode = "board-snap" | "free-assemble";

export type EdgeStyle = "classic" | "soft";

/** The source image. `width`/`height` are its natural pixel size (for aspect). */
export interface JigsawImage {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

/**
 * The complete description of a puzzle. This is the single contract every
 * variant configures; it is also what `schema.ts` validates on load.
 */
export interface JigsawConfig {
  image: JigsawImage;
  grid: { rows: number; cols: number };
  /** Reproducible cut + scatter. Same seed ⇒ identical puzzle, every time. */
  seed?: number;
  mode: AssemblyMode;
  edgeStyle?: EdgeStyle;
  /** Snap radius in px (board-pixel space). Defaults derive from cell size. */
  snapTolerance?: number;
}

/**
 * Per-seam shape parameters, derived deterministically from the seed. A "seam"
 * is the shared boundary between two adjacent pieces; both pieces read the same
 * params so their edges interlock exactly (one tab, one matching blank).
 *
 * The knob is kept symmetric about the seam midpoint so it reads identically no
 * matter which piece traverses it — only `flip` decides which side gets the tab.
 */
export interface Seam {
  /** True ⇒ the lower-index piece (left/top) carries the tab, else the blank. */
  flip: boolean;
  /** Neck half-width as a fraction of edge length. */
  neck: number;
  /** Bulb control reach as a fraction of edge length (drives knob height). */
  bulb: number;
}

/** All seams for a puzzle, split by orientation. */
export interface Seams {
  /** Vertical seams between column `c` and `c+1`. `vertical[r][c]`. */
  vertical: Seam[][];
  /** Horizontal seams between row `r` and `r+1`. `horizontal[r][c]`. */
  horizontal: Seam[][];
}

/**
 * Pixel layout derived from a board size. Pure geometry recomputed on resize;
 * because the cut is seeded, recomputation never changes which edge is a tab.
 */
export interface Layout {
  rows: number;
  cols: number;
  /** Image draw size (== board size); cells tile it exactly. */
  boardW: number;
  boardH: number;
  cellW: number;
  cellH: number;
  /** Uniform bbox margin that contains a piece's tabs on every side. */
  tab: number;
}

/**
 * A fully realised piece: geometry + where its slice of the image lives. All
 * coordinates are board-pixel space unless noted. Produced by `lib/pieces.ts`.
 */
export interface Piece {
  /** Stable id: `row * cols + col`. */
  id: number;
  row: number;
  col: number;
  edges: PieceEdges;
  /** Bounding-box size (uniform: cell + 2·tab on each axis). */
  width: number;
  height: number;
  /**
   * Closed clip path in piece-local px (origin = bbox top-left). Fed straight
   * to CSS `clip-path: path(...)` so the renderer needs no SVG defs.
   */
  path: string;
  /** Background-image offset placing the full image behind this piece. */
  imageOffsetX: number;
  imageOffsetY: number;
  /** Solved position: top-left of the bbox when the piece is in its slot. */
  targetX: number;
  targetY: number;
}

/**
 * Runtime placement of a piece, owned by the store. `x`/`y` are the bbox
 * top-left in board space; `group` is the cluster it currently moves with.
 */
export interface Placement {
  x: number;
  y: number;
  /** Disjoint-set root id of the piece's connected cluster. */
  group: number;
  /** Stacking order; higher renders on top. */
  z: number;
  /** Board-snap only: locked into its true slot and no longer draggable. */
  placed: boolean;
}

/** A rectangular region (board-pixel space) used for scatter placement. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

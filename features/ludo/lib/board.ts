/**
 * Ludo board geometry on a 15×15 grid (row/col, 0-indexed).
 *
 * The board is the classic cross: four 6×6 home bases in the corners and a
 * 52-cell ring threading between them, with a 6-cell coloured "home column"
 * per seat leading into the centre. All coordinates here are pure data — the
 * renderer maps a (row,col) onto a percentage offset, and the engine walks a
 * token along `ringPath` + each seat's `homeColumn`.
 */

export const GRID = 15;

export type Cell = { r: number; c: number };

/**
 * The 52-cell main track, clockwise. Index 0 is the cell a top-left seat
 * enters on; seats start every 13 cells (0, 13, 26, 39).
 */
export const RING_PATH: Cell[] = [
  // left arm → moving right along row 6
  { r: 6, c: 1 },
  { r: 6, c: 2 },
  { r: 6, c: 3 },
  { r: 6, c: 4 },
  { r: 6, c: 5 },
  // up column 6
  { r: 5, c: 6 },
  { r: 4, c: 6 },
  { r: 3, c: 6 },
  { r: 2, c: 6 },
  { r: 1, c: 6 },
  { r: 0, c: 6 },
  // top-middle
  { r: 0, c: 7 },
  // down column 8
  { r: 0, c: 8 },
  { r: 1, c: 8 },
  { r: 2, c: 8 },
  { r: 3, c: 8 },
  { r: 4, c: 8 },
  { r: 5, c: 8 },
  // top arm → moving right along row 6
  { r: 6, c: 9 },
  { r: 6, c: 10 },
  { r: 6, c: 11 },
  { r: 6, c: 12 },
  { r: 6, c: 13 },
  { r: 6, c: 14 },
  // right-middle
  { r: 7, c: 14 },
  // back left along row 8
  { r: 8, c: 14 },
  { r: 8, c: 13 },
  { r: 8, c: 12 },
  { r: 8, c: 11 },
  { r: 8, c: 10 },
  { r: 8, c: 9 },
  // down column 8
  { r: 9, c: 8 },
  { r: 10, c: 8 },
  { r: 11, c: 8 },
  { r: 12, c: 8 },
  { r: 13, c: 8 },
  { r: 14, c: 8 },
  // bottom-middle
  { r: 14, c: 7 },
  // up column 6
  { r: 14, c: 6 },
  { r: 13, c: 6 },
  { r: 12, c: 6 },
  { r: 11, c: 6 },
  { r: 10, c: 6 },
  { r: 9, c: 6 },
  // back left along row 8
  { r: 8, c: 5 },
  { r: 8, c: 4 },
  { r: 8, c: 3 },
  { r: 8, c: 2 },
  { r: 8, c: 1 },
  { r: 8, c: 0 },
  // left-middle, closing the loop
  { r: 7, c: 0 },
  { r: 6, c: 0 },
];

export const RING_LEN = RING_PATH.length; // 52

/** Centre triangle — finished tokens nest here. */
export const CENTER: Cell = { r: 7, c: 7 };

/**
 * Ring indices that are "safe" (a token there can never be captured). These are
 * the four seat-start cells plus the four star cells two steps past them.
 */
export const SAFE_RING_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

/** The four star cells (safe + they fire the "star" activity trigger). */
export const STAR_RING_INDICES = new Set([8, 21, 34, 47]);

export type SeatId = 0 | 1 | 2 | 3;

export type SeatGeometry = {
  id: SeatId;
  /** Ring index this seat's tokens enter on. */
  startRingIndex: number;
  /** 6 coloured cells from the ring turn-off to the centre approach. */
  homeColumn: Cell[];
  /** 4 resting spots inside the corner base. */
  baseSpots: [Cell, Cell, Cell, Cell];
  /** Bounding box of the corner base (for rendering the coloured quadrant). */
  baseBox: { r0: number; c0: number };
  /** Corner label, used to seat 2-player games diagonally. */
  corner: "tl" | "tr" | "br" | "bl";
};

/** Four resting spots inset within a 6×6 corner whose top-left is (r0,c0). */
function baseSpots(r0: number, c0: number): [Cell, Cell, Cell, Cell] {
  return [
    { r: r0 + 1.5, c: c0 + 1.5 },
    { r: r0 + 1.5, c: c0 + 3.5 },
    { r: r0 + 3.5, c: c0 + 1.5 },
    { r: r0 + 3.5, c: c0 + 3.5 },
  ];
}

export const SEATS: Record<SeatId, SeatGeometry> = {
  0: {
    id: 0,
    corner: "tl",
    startRingIndex: 0,
    homeColumn: [
      { r: 7, c: 1 },
      { r: 7, c: 2 },
      { r: 7, c: 3 },
      { r: 7, c: 4 },
      { r: 7, c: 5 },
      { r: 7, c: 6 },
    ],
    baseSpots: baseSpots(0, 0),
    baseBox: { r0: 0, c0: 0 },
  },
  1: {
    id: 1,
    corner: "tr",
    startRingIndex: 13,
    homeColumn: [
      { r: 1, c: 7 },
      { r: 2, c: 7 },
      { r: 3, c: 7 },
      { r: 4, c: 7 },
      { r: 5, c: 7 },
      { r: 6, c: 7 },
    ],
    baseSpots: baseSpots(0, 9),
    baseBox: { r0: 0, c0: 9 },
  },
  2: {
    id: 2,
    corner: "br",
    startRingIndex: 26,
    homeColumn: [
      { r: 7, c: 13 },
      { r: 7, c: 12 },
      { r: 7, c: 11 },
      { r: 7, c: 10 },
      { r: 7, c: 9 },
      { r: 7, c: 8 },
    ],
    baseSpots: baseSpots(9, 9),
    baseBox: { r0: 9, c0: 9 },
  },
  3: {
    id: 3,
    corner: "bl",
    startRingIndex: 39,
    homeColumn: [
      { r: 13, c: 7 },
      { r: 12, c: 7 },
      { r: 11, c: 7 },
      { r: 10, c: 7 },
      { r: 9, c: 7 },
      { r: 8, c: 7 },
    ],
    baseSpots: baseSpots(9, 0),
    baseBox: { r0: 9, c0: 0 },
  },
};

/** Final logical position: 0–50 ring, 51–56 home column, 56 = won. */
export const LAST_POS = 56;
export const HOME_ENTRY_POS = 51; // first home-column cell

/**
 * Resolve a token's (seat, logical position) to a board cell.
 *  - pos === -1  → resting in base
 *  - 0..50       → ring cell relative to the seat's start
 *  - 51..56      → the seat's home column
 */
export function cellForPosition(
  seat: SeatId,
  pos: number,
  baseIndex: number,
): Cell {
  if (pos < 0)
    return SEATS[seat].baseSpots[baseIndex] ?? SEATS[seat].baseSpots[0];
  if (pos < HOME_ENTRY_POS) {
    return RING_PATH[(SEATS[seat].startRingIndex + pos) % RING_LEN]!;
  }
  return SEATS[seat].homeColumn[pos - HOME_ENTRY_POS]!;
}

/** Ring index a ring-position maps to (for capture / safe checks). */
export function ringIndexForPosition(seat: SeatId, pos: number): number | null {
  if (pos < 0 || pos >= HOME_ENTRY_POS) return null;
  return (SEATS[seat].startRingIndex + pos) % RING_LEN;
}

/**
 * Snakes & Lovers board topology.
 *
 * The 100 dares are saved with a Creation. Which squares are Heat Rushes or
 * Slow Burns is not — it lives here so every device draws the same board.
 * A seeded search places 6 short ladders and 6 short snakes. If it cannot
 * find a clean layout, a hand-checked board is used instead.
 *
 * Assumptions: a link covers 2–5 rows, drifts at most 2 columns, and stays
 * off the safe squares (25, 50, 75) and the finale (100).
 */

export const BOARD_SIZE = 10;

export const LADDER_COUNT = 6;
export const SNAKE_COUNT = 6;

/** Inclusive row span is `rowDelta + 1`, so 1–4 means 2–5 rows. */
const MIN_ROW_DELTA = 1;
const MAX_ROW_DELTA = 4;
/** Keeps a link from slicing across the board. */
const MAX_COL_DELTA = 2;
/** Gap between centre-lines so a slight snake curve cannot cross a neighbour. */
const MIN_CLEARANCE = 1.8;
const MAX_ATTEMPTS = 200;
const SEED = 0x4b594e44;

/** Safe checkpoints and the finale — never an endpoint, never crossed. */
const RESERVED = new Set([25, 50, 75, 100]);

type Pt = { x: number; y: number };

type Link = {
  from: number;
  to: number;
  /** Track row (0 = bottom) of the square you land on. */
  startRow: number;
  col: number;
  cells: number[];
  ax: number;
  ay: number;
  bx: number;
  by: number;
};

export type BoardLayout = {
  ladders: Record<number, number>;
  snakes: Record<number, number>;
  source: "generated" | "fallback";
};

/** Rendered grid position. Row 0 is the top; square 1 is bottom-left. */
export function cellPosition(id: number): { row: number; col: number } {
  const r = Math.floor((id - 1) / BOARD_SIZE);
  const within = (id - 1) % BOARD_SIZE;
  const col = r % 2 === 0 ? within : BOARD_SIZE - 1 - within;
  return { row: BOARD_SIZE - 1 - r, col };
}

/** Centre of a square as percentages (0–100) of the board. */
export function cellCenter(id: number): Pt {
  const { row, col } = cellPosition(id);
  const step = 100 / BOARD_SIZE;
  return { x: (col + 0.5) * step, y: (row + 0.5) * step };
}

function trackRow(id: number): number {
  return Math.floor((id - 1) / BOARD_SIZE);
}

function idAt(rowFromBottom: number, col: number): number {
  const within = rowFromBottom % 2 === 0 ? col : BOARD_SIZE - 1 - col;
  return rowFromBottom * BOARD_SIZE + within + 1;
}

function idFromRendered(row: number, col: number): number {
  return idAt(BOARD_SIZE - 1 - row, col);
}

/** Every square the straight segment touches, including both ends. */
function cellsAlong(from: number, to: number): number[] {
  const a = cellPosition(from);
  const b = cellPosition(to);
  let x0 = a.col;
  let y0 = a.row;
  const x1 = b.col;
  const y1 = b.row;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  const cells: number[] = [];
  for (;;) {
    cells.push(idFromRendered(y0, x0));
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return cells;
}

function makeLink(from: number, to: number): Link {
  const a = cellCenter(from);
  const b = cellCenter(to);
  return {
    from,
    to,
    startRow: trackRow(from),
    col: cellPosition(from).col,
    cells: cellsAlong(from, to),
    ax: a.x,
    ay: a.y,
    bx: b.x,
    by: b.y,
  };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = next[i]!;
    next[i] = next[j]!;
    next[j] = swap;
  }
  return next;
}

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function properIntersect(a: Link, b: Link): boolean {
  const d1 = cross(b.bx - b.ax, b.by - b.ay, a.ax - b.ax, a.ay - b.ay);
  const d2 = cross(b.bx - b.ax, b.by - b.ay, a.bx - b.ax, a.by - b.ay);
  const d3 = cross(a.bx - a.ax, a.by - a.ay, b.ax - a.ax, b.ay - a.ay);
  const d4 = cross(a.bx - a.ax, a.by - a.ay, b.bx - a.ax, b.by - a.ay);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function pointSegDist(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function clearance(a: Link, b: Link): number {
  if (properIntersect(a, b)) return 0;
  return Math.min(
    pointSegDist(a.ax, a.ay, b.ax, b.ay, b.bx, b.by),
    pointSegDist(a.bx, a.by, b.ax, b.ay, b.bx, b.by),
    pointSegDist(b.ax, b.ay, a.ax, a.ay, a.bx, a.by),
    pointSegDist(b.bx, b.by, a.ax, a.ay, a.bx, a.by),
  );
}

function colDelta(link: Link): number {
  return Math.abs(cellPosition(link.from).col - cellPosition(link.to).col);
}

function candidates(kind: "ladder" | "snake"): Link[] {
  const links: Link[] = [];
  for (let from = 1; from <= BOARD_SIZE * BOARD_SIZE; from++) {
    if (RESERVED.has(from)) continue;
    const row = trackRow(from);
    const col = cellPosition(from).col;
    for (let dr = MIN_ROW_DELTA; dr <= MAX_ROW_DELTA; dr++) {
      const nextRow = kind === "ladder" ? row + dr : row - dr;
      if (nextRow < 0 || nextRow >= BOARD_SIZE) continue;
      for (let dc = -MAX_COL_DELTA; dc <= MAX_COL_DELTA; dc++) {
        const nextCol = col + dc;
        if (nextCol < 0 || nextCol >= BOARD_SIZE) continue;
        const to = idAt(nextRow, nextCol);
        if (to === from || RESERVED.has(to)) continue;
        if (kind === "ladder" && to <= from) continue;
        if (kind === "snake" && to >= from) continue;
        const link = makeLink(from, to);
        if (link.cells.some((cell) => RESERVED.has(cell))) continue;
        links.push(link);
      }
    }
  }
  return links;
}

/** One free square past each end, so two paths in a column cannot look like one line. */
function bufferedCells(link: Link): number[] {
  const cells = new Set(link.cells);
  for (const end of [link.from, link.to]) {
    const row = trackRow(end);
    const col = cellPosition(end).col;
    for (const next of [row - 1, row + 1]) {
      if (next < 0 || next >= BOARD_SIZE) continue;
      const id = idAt(next, col);
      if (!link.cells.includes(id)) cells.add(id);
    }
  }
  return [...cells];
}

function fits(link: Link, used: Set<number>, placed: Link[]): boolean {
  for (const cell of bufferedCells(link)) {
    if (used.has(cell)) return false;
  }
  return placed.every((other) => clearance(link, other) >= MIN_CLEARANCE);
}

function placeRows(
  pool: Link[],
  rows: number[],
  used: Set<number>,
  placed: Link[],
  usedCols: Set<number>,
): Link[] | null {
  const byRow = new Map<number, Link[]>();
  for (const link of pool) {
    const list = byRow.get(link.startRow);
    if (list) list.push(link);
    else byRow.set(link.startRow, [link]);
  }

  const chosen: Link[] = [];
  for (const row of rows) {
    const options = (byRow.get(row) ?? []).filter((link) =>
      fits(link, used, placed),
    );
    options.sort(
      (a, b) =>
        (usedCols.has(a.col) ? 1 : 0) - (usedCols.has(b.col) ? 1 : 0) ||
        colDelta(a) - colDelta(b) ||
        a.from - b.from ||
        a.to - b.to,
    );
    const pick = options[0];
    if (!pick) return null;
    chosen.push(pick);
    placed.push(pick);
    usedCols.add(pick.col);
    for (const cell of bufferedCells(pick)) used.add(cell);
  }
  return chosen;
}

function toRecord(links: Link[]): Record<number, number> {
  const record: Record<number, number> = {};
  for (const link of links) record[link.from] = link.to;
  return record;
}

/**
 * Last resort if the search cannot place a clean board. Vertical, 2–4 rows,
 * no shared squares. Checked by `boardLayoutProblems`.
 */
const FALLBACK_LINKS: {
  ladders: Record<number, number>;
  snakes: Record<number, number>;
} = {
  ladders: { 2: 19, 11: 30, 23: 38, 33: 48, 41: 60, 72: 89 },
  snakes: { 32: 9, 44: 4, 55: 15, 65: 36, 74: 34, 82: 42 },
};

function attempt(
  rng: () => number,
  ladderPool: Link[],
  snakePool: Link[],
): BoardLayout | null {
  const ladderRows = shuffle(
    Array.from({ length: 8 }, (_, row) => row),
    rng,
  ).slice(0, LADDER_COUNT);
  const snakeRows = shuffle(
    Array.from({ length: 7 }, (_, index) => index + 3),
    rng,
  ).slice(0, SNAKE_COUNT);

  const used = new Set<number>();
  const placed: Link[] = [];
  const usedCols = new Set<number>();
  const ladders = placeRows(ladderPool, ladderRows, used, placed, usedCols);
  if (!ladders) return null;
  const snakes = placeRows(snakePool, snakeRows, used, placed, usedCols);
  if (!snakes) return null;
  return {
    ladders: toRecord(ladders),
    snakes: toRecord(snakes),
    source: "generated",
  };
}

/**
 * Reasons a layout breaks the readability rules. Empty means it is safe to draw.
 */
export function boardLayoutProblems(
  ladders: Record<number, number>,
  snakes: Record<number, number>,
): string[] {
  const problems: string[] = [];
  const ladderLinks = Object.entries(ladders).map(([from, to]) =>
    makeLink(Number(from), to),
  );
  const snakeLinks = Object.entries(snakes).map(([from, to]) =>
    makeLink(Number(from), to),
  );

  if (ladderLinks.length !== LADDER_COUNT)
    problems.push(`expected ${LADDER_COUNT} ladders`);
  if (snakeLinks.length !== SNAKE_COUNT)
    problems.push(`expected ${SNAKE_COUNT} snakes`);

  const endpoints = new Set<number>();
  const used = new Set<number>();

  const check = (link: Link, kind: "ladder" | "snake") => {
    const rowDelta = trackRow(link.to) - trackRow(link.from);
    const delta = kind === "ladder" ? rowDelta : -rowDelta;
    if (delta < MIN_ROW_DELTA || delta > MAX_ROW_DELTA) {
      problems.push(
        `${kind} ${link.from}→${link.to} spans ${Math.abs(rowDelta) + 1} rows`,
      );
    }
    if (colDelta(link) > MAX_COL_DELTA) {
      problems.push(
        `${kind} ${link.from}→${link.to} drifts ${colDelta(link)} columns`,
      );
    }
    if (kind === "ladder" && link.to <= link.from)
      problems.push(`ladder ${link.from} does not climb`);
    if (kind === "snake" && link.to >= link.from)
      problems.push(`snake ${link.from} does not slide back`);
    for (const end of [link.from, link.to]) {
      if (RESERVED.has(end))
        problems.push(`${kind} uses reserved square ${end}`);
      if (endpoints.has(end)) problems.push(`square ${end} is used twice`);
      endpoints.add(end);
    }
    for (const cell of link.cells) {
      if (RESERVED.has(cell))
        problems.push(`${kind} ${link.from}→${link.to} crosses ${cell}`);
      if (used.has(cell)) problems.push(`square ${cell} is on two paths`);
      used.add(cell);
    }
  };

  for (const link of ladderLinks) check(link, "ladder");
  for (const link of snakeLinks) check(link, "snake");

  const all = [...ladderLinks, ...snakeLinks];
  for (let i = 0; i < all.length; i++) {
    const buffer = new Set(bufferedCells(all[i]!));
    for (let j = i + 1; j < all.length; j++) {
      const gap = clearance(all[i]!, all[j]!);
      if (gap < MIN_CLEARANCE) {
        problems.push(
          `${all[i]!.from}→${all[i]!.to} passes ${all[j]!.from}→${all[j]!.to} (gap ${gap.toFixed(2)})`,
        );
      }
      if (all[j]!.cells.some((cell) => buffer.has(cell))) {
        problems.push(
          `no free square between ${all[i]!.from}→${all[i]!.to} and ${all[j]!.from}→${all[j]!.to}`,
        );
      }
    }
  }
  return problems;
}

function buildLayout(): BoardLayout {
  const ladderPool = candidates("ladder");
  const snakePool = candidates("snake");
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const layout = attempt(mulberry32(SEED + i), ladderPool, snakePool);
    if (!layout) continue;
    if (boardLayoutProblems(layout.ladders, layout.snakes).length === 0)
      return layout;
  }
  return { ...FALLBACK_LINKS, source: "fallback" };
}

const layout = buildLayout();

if (boardLayoutProblems(layout.ladders, layout.snakes).length > 0) {
  throw new Error("Snakes & Lovers board layout failed its readability checks");
}

export const LADDERS: Record<number, number> = layout.ladders;
export const SNAKES: Record<number, number> = layout.snakes;
export const BOARD_LAYOUT_SOURCE: BoardLayout["source"] = layout.source;

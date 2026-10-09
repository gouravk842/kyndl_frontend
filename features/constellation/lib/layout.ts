/**
 * Constellation — sky layout.
 *
 * Two arrangements:
 * - `stars`: memories in story order along a gentle curve. The camera scrolls;
 *   the meadow stays on the screen.
 * - `constellations`: memories gather by week, month, or year. Each period is
 *   its own figure. A period with one memory stays a single star. Thin periods
 *   join a neighbour; a period past seven stars splits into figures that share
 *   a name.
 *
 * `x` is world space (percent of one viewport width) and grows past 100.
 */

import type {
  GroupGrain,
  SkyConfig,
  Star,
} from "@/features/constellation/config";

const round1 = (v: number) => Math.round(v * 10) / 10;

export type BloomResult = {
  stars: Star[];
  /** Explicit edges for the painter / builder — replaces sequential fallback. */
  edges: [number, number][];
};

export type SkyFigure = {
  /** Period title, a shared stretch name, or "" when the memories are undated. */
  label: string;
  starIds: number[];
  centerX: number;
  centerY: number;
};

/**
 * Sort stars into story order: calendar date when present, otherwise the
 * author's list order. Stable for equal timestamps.
 */
export function storyOrder(stars: Star[]): Star[] {
  return stars
    .map((s, index) => ({ s, index }))
    .sort((a, b) => {
      const ta = a.s.timestamp?.trim() || "";
      const tb = b.s.timestamp?.trim() || "";
      if (ta && tb && ta !== tb) return ta < tb ? -1 : 1;
      if (ta && !tb) return -1;
      if (!ta && tb) return 1;
      return a.index - b.index;
    })
    .map(({ s }) => s);
}

/** Gap between memories on the individual-star path, in percent of one viewport. */
export const PATH_GAP = 14;
const PATH_ORIGIN = 40;

/** A figure needs three stars. Past this, the period splits. */
const MIN_FIGURE = 3;
const MAX_FIGURE = 7;
/** Centre-to-centre distance between figures, in viewport percent. */
const FIGURE_STRIDE = 64;
const SHAPE_X = 11;
const SHAPE_Y = 9;

/**
 * Lay memories along a gentle path in story order. `x` is world space (it grows
 * past 100 as the sky gets longer). Edges join neighbours only.
 */
export function placeOnPath(stars: Star[]): BloomResult {
  if (stars.length === 0) return { stars: [], edges: [] };

  const ordered = storyOrder(stars);
  const indexOf = new Map(ordered.map((s, i) => [s.id, i]));
  const positioned = stars.map((star) => {
    const i = indexOf.get(star.id) ?? 0;
    return {
      ...star,
      x: round1(PATH_ORIGIN + i * PATH_GAP),
      y: round1(34 + Math.sin(i * 0.65) * 14),
    };
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i];
    const b = ordered[i + 1];
    if (a && b) edges.push([a.id, b.id]);
  }
  return { stars: positioned, edges };
}

/** @deprecated Use {@link placeOnPath}. Kept so older imports still compile. */
export function bloomConstellation(stars: Star[]): BloomResult {
  return placeOnPath(stars);
}

/** How far the camera may travel. `finale` sits in the empty dark past the last star. */
export function pathCameraBounds(stars: Star[]): {
  min: number;
  max: number;
  start: number;
  finale: number;
} {
  if (stars.length === 0) {
    return { min: -40, max: 120, start: PATH_ORIGIN, finale: PATH_ORIGIN + 42 };
  }
  const xs = stars.map((s) => s.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  return {
    min: minX - 80,
    max: maxX + 96,
    start: minX,
    finale: maxX + 42,
  };
}

/** Where the next memory lands, before the whole path is reflowed. */
export function nextPathSlot(existingCount: number): { x: number; y: number } {
  return {
    x: round1(PATH_ORIGIN + existingCount * PATH_GAP),
    y: round1(34 + Math.sin(existingCount * 0.65) * 14),
  };
}

/** @deprecated Use {@link nextPathSlot}. */
export function nextBloomSlot(existingCount: number): { x: number; y: number } {
  return nextPathSlot(existingCount);
}

type Shape = { points: [number, number][]; edges: [number, number][] };

/** Local figures. y is screen-down. Count picks the silhouette. */
const SHAPES: Record<number, Shape> = {
  1: { points: [[0, 0]], edges: [] },
  2: {
    points: [
      [-0.62, 0.06],
      [0.62, -0.06],
    ],
    edges: [[0, 1]],
  },
  3: {
    points: [
      [-1, 0.18],
      [0, -0.06],
      [1, 0.12],
    ],
    edges: [
      [0, 1],
      [1, 2],
    ],
  },
  4: {
    points: [
      [0, -0.95],
      [-0.9, 0.05],
      [0, 0.85],
      [0.9, 0.1],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
  },
  5: {
    points: [
      [-0.95, -0.45],
      [-1.05, 0.35],
      [0, 0.85],
      [1.05, 0.35],
      [0.95, -0.45],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  6: {
    points: [
      [-0.15, -1],
      [-0.55, -0.35],
      [-0.95, 0.2],
      [-0.55, 0.8],
      [0.25, 0.85],
      [0.95, 0.15],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  7: {
    points: [
      [-1.15, 0.15],
      [-0.7, 0.55],
      [-0.15, 0.05],
      [0.3, -0.45],
      [0.9, -0.1],
      [1.1, -0.75],
      [0.4, -0.95],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ],
  },
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type DateParts = { y: number; m: number; d: number };

function dateParts(iso?: string): DateParts | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** ISO week of a calendar date. Key is `YYYY-Www` using the ISO year. */
function isoWeek(parts: DateParts): { year: number; week: number } {
  const date = new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { year: isoYear, week };
}

function mondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
  return monday;
}

function formatDay(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`;
}

export function periodKey(
  iso: string | undefined,
  grain: GroupGrain,
): string | null {
  const parts = dateParts(iso);
  if (!parts) return null;
  if (grain === "year") return String(parts.y);
  if (grain === "month")
    return `${parts.y}-${String(parts.m).padStart(2, "0")}`;
  const week = isoWeek(parts);
  return `${week.year}-W${String(week.week).padStart(2, "0")}`;
}

function formatPeriod(key: string, grain: GroupGrain): string {
  if (grain === "year") return key;
  if (grain === "month") {
    const [y, m] = key.split("-");
    const name = MONTHS[Number(m) - 1];
    return name ? `${name} ${y}` : key;
  }
  const match = /^(\d{4})-W(\d{2})$/.exec(key);
  if (!match) return key;
  const monday = mondayOfIsoWeek(Number(match[1]), Number(match[2]));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const year = sunday.getUTCFullYear();
  if (monday.getUTCMonth() === sunday.getUTCMonth()) {
    return `${monday.getUTCDate()}–${sunday.getUTCDate()} ${MONTHS_SHORT[monday.getUTCMonth()]} ${year}`;
  }
  return `${formatDay(monday)} – ${formatDay(sunday)} ${year}`;
}

function sharedStretch(stars: Star[]): string | null {
  const names = stars.map((s) => s.stretch?.trim() || "");
  if (names.some((n) => !n)) return null;
  const first = names[0];
  if (!first || names.some((n) => n !== first)) return null;
  return first;
}

function periodKeysOf(stars: Star[], grain: GroupGrain): string[] {
  const keys: string[] = [];
  for (const star of stars) {
    const key = periodKey(star.timestamp, grain);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

function spanLabel(keys: string[], grain: GroupGrain): string {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return "";
  if (keys.length === 1) return formatPeriod(first, grain);
  if (grain === "year") return `${first} – ${last}`;
  if (grain === "month") {
    const [y1, m1] = first.split("-").map(Number);
    const [y2, m2] = last.split("-").map(Number);
    const a = MONTHS[(m1 ?? 1) - 1];
    const b = MONTHS[(m2 ?? 1) - 1];
    if (!a || !b || y1 == null || y2 == null)
      return `${formatPeriod(first, grain)} – ${formatPeriod(last, grain)}`;
    if (y1 === y2) return `${a} – ${b} ${y1}`;
    return `${a} ${y1} – ${b} ${y2}`;
  }
  const start = /^(\d{4})-W(\d{2})$/.exec(first);
  const end = /^(\d{4})-W(\d{2})$/.exec(last);
  if (!start || !end)
    return `${formatPeriod(first, grain)} – ${formatPeriod(last, grain)}`;
  const monday = mondayOfIsoWeek(Number(start[1]), Number(start[2]));
  const endMonday = mondayOfIsoWeek(Number(end[1]), Number(end[2]));
  const sunday = new Date(endMonday);
  sunday.setUTCDate(endMonday.getUTCDate() + 6);
  return `${formatDay(monday)} – ${formatDay(sunday)} ${sunday.getUTCFullYear()}`;
}

/** Title painted on the sky. Empty when the figure has no dates and no shared stretch. */
export function figureTitle(stars: Star[], grain: GroupGrain): string {
  const stretch = sharedStretch(stars);
  if (stretch) return stretch;
  const keys = periodKeysOf(stars, grain);
  if (keys.length === 0) return "";
  return spanLabel(keys, grain);
}

/** Label in the authoring list. Undated figures say so. */
export function authorFigureLabel(label: string): string {
  return label.trim() || "Undated";
}

type Bucket = { dated: boolean; stars: Star[] };

function isThin(bucket: Bucket): boolean {
  return bucket.stars.length < MIN_FIGURE;
}

function splitSizes(count: number): number[] {
  if (count <= MAX_FIGURE) return [count];
  const parts = Math.ceil(count / MAX_FIGURE);
  const base = Math.floor(count / parts);
  const extra = count % parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

function buildFigures(
  stars: Star[],
  grain: GroupGrain,
): { label: string; stars: Star[] }[] {
  if (stars.length === 0) return [];
  const raw: Bucket[] = [];
  for (const star of storyOrder(stars)) {
    const key = periodKey(star.timestamp, grain);
    const dated = key != null;
    const last = raw[raw.length - 1];
    const lastKey = last
      ? periodKey(last.stars[0]?.timestamp, grain)
      : undefined;
    if (last && last.dated === dated && lastKey === key) last.stars.push(star);
    else raw.push({ dated, stars: [star] });
  }

  const split = raw.flatMap((bucket) => {
    const sizes = splitSizes(bucket.stars.length);
    let offset = 0;
    return sizes.map((size) => {
      const slice = bucket.stars.slice(offset, offset + size);
      offset += size;
      return { dated: bucket.dated, stars: slice };
    });
  });

  const pending = split.map((b) => ({ dated: b.dated, stars: [...b.stars] }));

  // Lonely periods clump with each other first, so three one-star months
  // become one figure instead of three dots.
  const clumped: Bucket[] = [];
  for (const bucket of pending) {
    const prev = clumped[clumped.length - 1];
    if (
      isThin(bucket) &&
      prev &&
      isThin(prev) &&
      prev.dated === bucket.dated &&
      prev.stars.length + bucket.stars.length <= MAX_FIGURE
    ) {
      prev.stars = prev.stars.concat(bucket.stars);
      continue;
    }
    clumped.push({ dated: bucket.dated, stars: [...bucket.stars] });
  }

  // A leftover pair or single star may join one neighbouring figure, once,
  // so it does not chain through and swallow the next period too.
  const absorbed = new Set<Bucket>();
  const merged: Bucket[] = [];
  for (let i = 0; i < clumped.length; i++) {
    const cur = clumped[i];
    if (!cur) continue;
    if (!isThin(cur)) {
      merged.push(cur);
      continue;
    }
    const prev = merged[merged.length - 1];
    const next = clumped[i + 1];
    const prevOk =
      !!prev &&
      !isThin(prev) &&
      !absorbed.has(prev) &&
      prev.dated === cur.dated &&
      prev.stars.length + cur.stars.length <= MAX_FIGURE;
    const nextOk =
      !!next &&
      !isThin(next) &&
      !absorbed.has(next) &&
      next.dated === cur.dated &&
      cur.stars.length + next.stars.length <= MAX_FIGURE;
    if (
      prevOk &&
      prev &&
      (!nextOk || prev.stars.length <= (next?.stars.length ?? 0))
    ) {
      prev.stars = prev.stars.concat(cur.stars);
      absorbed.add(prev);
      continue;
    }
    if (nextOk && next) {
      next.stars = cur.stars.concat(next.stars);
      absorbed.add(next);
      continue;
    }
    merged.push(cur);
  }

  return merged.map((bucket) => ({
    label: figureTitle(bucket.stars, grain),
    stars: bucket.stars,
  }));
}

function shapeFor(count: number): Shape {
  return SHAPES[Math.min(Math.max(count, 1), 7)] ?? SHAPES[1]!;
}

/**
 * Lay each time-group as its own figure. Positions replace `x` / `y`. Edges
 * stay inside a figure, so the sky reads as many constellations.
 */
export function placeAsConstellations(
  stars: Star[],
  grain: GroupGrain,
): BloomResult {
  if (stars.length === 0) return { stars: [], edges: [] };
  const figures = buildFigures(stars, grain);
  const pos = new Map<number, { x: number; y: number }>();
  const edges: [number, number][] = [];

  figures.forEach((fig, i) => {
    const shape = shapeFor(fig.stars.length);
    const cx = PATH_ORIGIN + i * FIGURE_STRIDE;
    const cy = 34 + Math.sin(i * 1.15) * 6;
    const flip = i % 2 === 1 ? -1 : 1;
    const rot = ((i % 3) - 1) * 0.22;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    fig.stars.forEach((star, si) => {
      const p = shape.points[si] ?? [0, 0];
      const lx = p[0] * flip;
      const ly = p[1];
      const x = cx + (lx * cos - ly * sin) * SHAPE_X;
      const y = cy + (lx * sin + ly * cos) * SHAPE_Y;
      pos.set(star.id, {
        x: round1(x),
        y: round1(Math.min(64, Math.max(14, y))),
      });
    });
    for (const [a, b] of shape.edges) {
      const from = fig.stars[a];
      const to = fig.stars[b];
      if (from && to) edges.push([from.id, to.id]);
    }
  });

  return {
    stars: stars.map((star) => {
      const at = pos.get(star.id);
      return at ? { ...star, x: at.x, y: at.y } : star;
    }),
    edges,
  };
}

/** Reflow a document into whichever arrangement the author chose. */
export function layoutDocument(doc: SkyConfig): SkyConfig {
  const placed =
    doc.organization === "constellations"
      ? placeAsConstellations(doc.stars, doc.groupBy ?? "month")
      : placeOnPath(doc.stars);
  return {
    ...doc,
    stars: placed.stars,
    customEdges: placed.edges.length > 0 ? placed.edges : undefined,
  };
}

/** Figures in time order, centred on wherever their stars currently sit. */
export function listFigures(stars: Star[], grain: GroupGrain): SkyFigure[] {
  return buildFigures(stars, grain).map((fig) => {
    const centerX =
      fig.stars.reduce((sum, s) => sum + s.x, 0) / fig.stars.length;
    const centerY =
      fig.stars.reduce((sum, s) => sum + s.y, 0) / fig.stars.length;
    return {
      label: fig.label,
      starIds: fig.stars.map((s) => s.id),
      centerX,
      centerY,
    };
  });
}

/** First visit opens on the oldest memory. A return visit opens on the newest. */
export function cameraHomes(doc: SkyConfig): {
  oldest: number;
  newest: number;
} {
  if (doc.stars.length === 0)
    return { oldest: PATH_ORIGIN, newest: PATH_ORIGIN };
  if (doc.organization !== "constellations") {
    const ordered = storyOrder(doc.stars);
    return {
      oldest: ordered[0]?.x ?? PATH_ORIGIN,
      newest: ordered[ordered.length - 1]?.x ?? PATH_ORIGIN,
    };
  }
  const figures = listFigures(doc.stars, doc.groupBy ?? "month");
  const first = figures[0];
  const last = figures[figures.length - 1];
  return {
    oldest: first?.centerX ?? PATH_ORIGIN,
    newest: last?.centerX ?? PATH_ORIGIN,
  };
}

/**
 * 1 beside the camera, falling toward a dim floor as a figure slips toward
 * the edge of the night. Used so distant constellations stay visible.
 */
export function starPresence(x: number, scroll: number): number {
  const dist = Math.abs(x - scroll);
  const inner = 16;
  const outer = 46;
  if (dist <= inner) return 1;
  if (dist >= outer) return 0.28;
  const t = (dist - inner) / (outer - inner);
  const s = t * t * (3 - 2 * t);
  return 0.28 + 0.72 * (1 - s);
}

/** The figure name to whisper, fading out in the dark between constellations. */
export function figureLabelAt(
  doc: SkyConfig,
  scroll: number,
): { text: string; presence: number } | null {
  if (doc.organization !== "constellations" || doc.stars.length === 0)
    return null;
  const figures = listFigures(doc.stars, doc.groupBy ?? "month");
  let best: SkyFigure | null = null;
  let bestDist = Infinity;
  for (const fig of figures) {
    const dist = Math.abs(fig.centerX - scroll);
    if (dist < bestDist) {
      best = fig;
      bestDist = dist;
    }
  }
  if (!best?.label) return null;
  const near = starPresence(best.centerX, scroll);
  const presence = near < 0.78 ? 0 : (near - 0.78) / 0.22;
  if (presence <= 0.04) return null;
  return { text: best.label, presence };
}

/** Order the guided tour walks: story order, and figure by figure when grouped. */
export function tourOrder(doc: SkyConfig): Star[] {
  if (doc.organization !== "constellations") return storyOrder(doc.stars);
  const byId = new Map(doc.stars.map((s) => [s.id, s]));
  const ordered: Star[] = [];
  for (const fig of listFigures(doc.stars, doc.groupBy ?? "month")) {
    for (const id of fig.starIds) {
      const star = byId.get(id);
      if (star) ordered.push(star);
    }
  }
  return ordered;
}

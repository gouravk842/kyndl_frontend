/**
 * The Memory City layout engine.
 *
 * Turns *meaning* (a list of memories, each with a date) into a *place* (world
 * positions, districts, a camera path, roads, and filler buildings) — with no
 * hand-authored coordinates anywhere. This is the keystone that lets the city
 * **arrange itself** and **grow**: add a memory to the input list and the whole
 * world re-derives.
 *
 * ## The shape
 * Memories are laid along a widening **spiral avenue** in chronological order,
 * oldest at the heart of the city and newest on the outer frontier. Walking the
 * spiral outward = walking forward through time. Because placement follows
 * chronological order from the centre out, **appending a newer memory only
 * extends the spiral** — every existing building keeps its spot. (Inserting an
 * *older* memory mid-timeline reflows the arc after it; that's the honest
 * trade-off of keeping the timeline literal, and the common case — adding recent
 * memories — is append-only.)
 *
 * Contiguous stretches of the spiral are grouped into **eras** (districts), cut
 * wherever there's a long gap between memories or an era grows too large. Filler
 * buildings line both sides of the avenue so the street reads as a city, not a
 * lonely string of towers.
 *
 * Everything is deterministic (see `prng.ts`) — same input → identical city.
 */

import { makeRng } from "./prng";

/** A world-space coordinate `[x, y, z]`. */
export type Vec3 = [number, number, number];

/** Engine input: the only thing placement needs from a memory is its identity + date. */
export interface LayoutMemory {
  id: string;
  /** ISO date (YYYY-MM-DD) or any `Date`-parseable string. Blank/invalid sorts last. */
  date: string;
}

/** A contiguous run of memories that reads as one district. */
export interface Era {
  index: number;
  /** Memory ids in this era, chronological. */
  memoryIds: string[];
  /** ISO date range covered (for naming the district). */
  startDate: string;
  endDate: string;
  /** Centroid of the era's node positions (district centre for roam tether). */
  center: Vec3;
}

/** Where a single memory's building stands. */
export interface PlacedMemory {
  id: string;
  eraIndex: number;
  /** Global chronological index (0 = oldest). */
  order: number;
  position: Vec3;
  /** Facing, radians — buildings turn to address the avenue. */
  rotationY: number;
}

/** A non-interactive building that fleshes out a city block. */
export interface FillerBuilding {
  position: Vec3;
  /** Full extents `[width, height, depth]`. */
  size: Vec3;
  rotationY: number;
  /** 0..1 seeded value the renderer can map to a palette / lit-window density. */
  tint: number;
}

/** The complete derived world. */
export interface CityLayout {
  eras: Era[];
  placed: Record<string, PlacedMemory>;
  /** Chronological memory ids. */
  order: string[];
  /** Camera revolve spline control points, at eye height, weaving the avenue. */
  path: Vec3[];
  /** Ground polylines: the spiral avenue + radial connectors to the plaza. */
  roads: Vec3[][];
  fillers: FillerBuilding[];
  /** Outer radius of the built city (for fog/ground sizing). */
  radius: number;
}

export interface LayoutParams {
  /** Stable seed — pass the city id so each city is its own world. */
  seed: string;
  /** A new era starts when the gap to the next memory exceeds this many days. */
  eraGapDays: number;
  /** Hard cap on memories per era (keeps districts walkable). */
  eraMax: number;
  /** Approximate spacing between consecutive memory buildings (world units). */
  nodeSpacing: number;
  /** Radial distance between successive spiral arms. */
  ringSpacing: number;
  /** Starting radius — the empty central plaza. */
  plazaRadius: number;
  /** Camera eye height for the revolve path. */
  eyeHeight: number;
  /** Filler buildings spawned per memory (both sides of the avenue). */
  fillersPerNode: number;
  /** Hard cap on total fillers (perf ceiling). */
  maxFillers: number;
}

export const DEFAULT_LAYOUT_PARAMS: LayoutParams = {
  seed: "city",
  eraGapDays: 240,
  eraMax: 8,
  nodeSpacing: 10,
  ringSpacing: 16,
  plazaRadius: 9,
  eyeHeight: 1.7,
  fillersPerNode: 3,
  maxFillers: 160,
};

const MS_PER_DAY = 86_400_000;

/** Parse an ISO-ish date to a sortable number; NaN dates sort to the end. */
function dateValue(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/**
 * Derive the whole city from its memories. Pure and deterministic.
 */
export function generateLayout(
  memories: LayoutMemory[],
  params: Partial<LayoutParams> = {},
): CityLayout {
  const p = { ...DEFAULT_LAYOUT_PARAMS, ...params };

  // 1 ─ Chronological order (stable: id breaks date ties so the result is total).
  const sorted = [...memories].sort((a, b) => {
    const d = dateValue(a.date) - dateValue(b.date);
    if (d !== 0) return d;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  // 2 ─ Bucket into eras by time-gap or size cap.
  const eraIds: string[][] = [];
  let bucket: string[] = [];
  let prevVal = Number.NaN;
  for (const m of sorted) {
    const v = dateValue(m.date);
    const gapDays = Number.isNaN(prevVal) ? 0 : (v - prevVal) / MS_PER_DAY;
    const cut = bucket.length > 0 && (gapDays > p.eraGapDays || bucket.length >= p.eraMax);
    if (cut) {
      eraIds.push(bucket);
      bucket = [];
    }
    bucket.push(m.id);
    prevVal = v;
  }
  if (bucket.length) eraIds.push(bucket);

  const dateOf = new Map(sorted.map((m) => [m.id, m.date]));
  const eraOf = new Map<string, number>();
  eraIds.forEach((ids, e) => ids.forEach((id) => eraOf.set(id, e)));

  // 3 ─ Walk the spiral, placing one building per memory.
  const jitter = makeRng(`${p.seed}:jitter`);
  const b = p.ringSpacing / (2 * Math.PI); // Archimedean growth: r = plaza + b·θ
  const placed: Record<string, PlacedMemory> = {};
  const order: string[] = [];
  let theta = 0;
  let orderIndex = 0;

  for (let e = 0; e < eraIds.length; e++) {
    // A small angular break between eras reads as a district boundary.
    if (e > 0) theta += (p.nodeSpacing * 1.4) / (p.plazaRadius + b * theta);
    for (const id of eraIds[e]!) {
      const r = p.plazaRadius + b * theta;
      const jr = jitter.range(-0.18, 0.18) * p.nodeSpacing;
      const rr = r + jr;
      const x = Math.cos(theta) * rr;
      const z = Math.sin(theta) * rr;
      // Address the avenue: face roughly tangent to the spiral.
      const rotationY = -theta + Math.PI / 2 + jitter.range(-0.2, 0.2);
      placed[id] = { id, eraIndex: e, order: orderIndex, position: [x, 0, z], rotationY };
      order.push(id);
      orderIndex++;
      // Advance ~constant arc length between nodes.
      theta += p.nodeSpacing / Math.max(r, 1);
    }
  }

  const outerR = p.plazaRadius + b * theta;
  const radius = outerR + p.nodeSpacing * 2;

  // 4 ─ Eras with centroids (district centres).
  const eras: Era[] = eraIds.map((ids, e) => {
    let cx = 0;
    let cz = 0;
    for (const id of ids) {
      cx += placed[id]!.position[0];
      cz += placed[id]!.position[2];
    }
    const n = Math.max(ids.length, 1);
    return {
      index: e,
      memoryIds: ids,
      startDate: dateOf.get(ids[0]!) ?? "",
      endDate: dateOf.get(ids[ids.length - 1]!) ?? "",
      center: [cx / n, 0, cz / n],
    };
  });

  // 5 ─ Camera path: weave just inside the building line, at eye height.
  const path: Vec3[] = [[0, p.eyeHeight, p.plazaRadius * 0.5]];
  for (const id of order) {
    const [px, , pz] = placed[id]!.position;
    const inward = 0.82; // pull the camera toward the plaza side of each building
    path.push([px * inward, p.eyeHeight, pz * inward]);
  }
  if (order.length) {
    const last = placed[order[order.length - 1]!]!.position;
    path.push([last[0] * 1.05, p.eyeHeight, last[2] * 1.05]);
  }

  // 6 ─ Roads: a smooth spiral avenue + radial spokes to each era.
  const avenue: Vec3[] = [];
  const samples = Math.max(48, order.length * 8);
  for (let i = 0; i <= samples; i++) {
    const th = (i / samples) * theta;
    const r = p.plazaRadius + b * th;
    avenue.push([Math.cos(th) * r, 0.02, Math.sin(th) * r]);
  }
  const roads: Vec3[][] = [avenue];
  for (const era of eras) {
    roads.push([[0, 0.02, 0], [era.center[0], 0.02, era.center[2]]]);
  }

  // 7 ─ Filler buildings lining both sides of the avenue → the city "fabric".
  const fillers = buildFillers(order, placed, p);

  return { eras, placed, order, path, roads, fillers, radius };
}

/**
 * Place non-interactive buildings on either side of each memory, offset along the
 * radial so they form street walls rather than overlapping the avenue. Seeded, so
 * the skyline is stable across reloads.
 */
function buildFillers(
  order: string[],
  placed: Record<string, PlacedMemory>,
  p: LayoutParams,
): FillerBuilding[] {
  const rng = makeRng(`${p.seed}:fillers`);
  const out: FillerBuilding[] = [];

  for (const id of order) {
    const node = placed[id]!;
    const [nx, , nz] = node.position;
    const rad = Math.hypot(nx, nz) || 1;
    const ux = nx / rad; // outward radial unit
    const uz = nz / rad;

    for (let k = 0; k < p.fillersPerNode; k++) {
      if (out.length >= p.maxFillers) return out;
      // Alternate the two sides of the avenue and step outward in rows.
      const side = k % 2 === 0 ? 1 : -1;
      const row = Math.floor(k / 2);
      const offset = (p.nodeSpacing * 0.55 + row * p.nodeSpacing * 0.9) * side;
      // Perpendicular jog so blocks aren't a perfect line.
      const jog = rng.range(-1, 1) * p.nodeSpacing * 0.35;
      const tx = -uz; // tangent unit
      const tz = ux;
      const px = nx + ux * offset + tx * jog;
      const pz = nz + uz * offset + tz * jog;

      const w = rng.range(2.2, 4.2);
      const d = rng.range(2.2, 4.2);
      const h = rng.range(4, 16) * (side > 0 ? 1 : 0.8);
      out.push({
        position: [px, 0, pz],
        size: [w, h, d],
        rotationY: Math.atan2(px, pz) + rng.range(-0.25, 0.25),
        tint: rng.next(),
      });
    }
  }
  return out;
}

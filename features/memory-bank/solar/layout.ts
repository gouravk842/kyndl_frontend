import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

export const CLUSTER_AT = 12;
export const LIST_SUGGEST_AT = 60;
export const DIM_AFTER_MS = 90 * 24 * 60 * 60 * 1000;
export const ELLIPSE_RATIO = 0.8;

export type ViewSize = { w: number; h: number };

export type CircleBody = {
  id: string;
  x: number;
  y: number;
  r: number;
};

export type PlanetBody = CircleBody & {
  ring: number;
  rx: number;
  ry: number;
  baseAngle: number;
  period: number;
};

export type SkyLayout = {
  cx: number;
  cy: number;
  youR: number;
  rings: { rx: number; ry: number }[];
  planets: PlanetBody[];
};

export type MoonBody = CircleBody & {
  ring: number;
  label: string;
  baseAngle: number;
  period: number;
  dim: boolean;
  clustered: boolean;
  hiddenCount: number;
};

export type BankSolarLayout = {
  cx: number;
  cy: number;
  sunR: number;
  rings: { r: number; label: string }[];
  moons: MoonBody[];
  suggestList: boolean;
  hiddenCount: number;
};

export function hashUnit(id: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function planetRingCount(n: number, viewW: number): number {
  if (n <= 0) return 0;
  if (n <= 3) return 1;
  const mobile = viewW < 640;
  if (n <= 8) return mobile ? 2 : 3;
  return mobile ? 3 : 4;
}

export function planetRadius(count: number, isLoose = false): number {
  if (isLoose) return 22;
  return Math.min(48, 26 + Math.sqrt(Math.max(count, 0)) * 4.2);
}

export function moonRadius(id: string): number {
  return 16 + Math.round(hashUnit(id, 11) * 6);
}

export function ellipsePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

export function circlesOverlap(a: CircleBody, b: CircleBody, pad = 8): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const min = a.r + b.r + pad;
  return dx * dx + dy * dy < min * min;
}

export function anyOverlap(bodies: CircleBody[], pad = 8): boolean {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      if (a && b && circlesOverlap(a, b, pad)) return true;
    }
  }
  return false;
}

export const SKY_PAD = { top: 96, side: 40, bottom: 56 };

export function ringPeriod(ring: number) {
  return 48 + ring * 20;
}

function minRxForCount(n: number, maxR: number): number {
  if (n <= 1) return Math.max(80, maxR * 2.6);
  const chord = maxR * 2 + 28;
  return Math.max(80, chord / (2 * Math.sin(Math.PI / n)));
}

function assignPlanetRings(n: number, ringCount: number): number[] {
  if (n <= 0 || ringCount <= 0) return [];
  const weights = Array.from({ length: ringCount }, (_, i) => i + 1);
  const total = weights.reduce((sum, w) => sum + w, 0);
  const counts = weights.map((w) => Math.max(1, Math.round((n * w) / total)));
  let diff = counts.reduce((sum, c) => sum + c, 0) - n;
  let cursor = ringCount - 1;
  while (diff !== 0 && cursor >= 0) {
    const current = counts[cursor] ?? 1;
    if (diff > 0 && current > 1) {
      counts[cursor] = current - 1;
      diff -= 1;
    } else if (diff < 0) {
      counts[cursor] = current + 1;
      diff += 1;
    } else {
      cursor -= 1;
    }
  }
  const rings: number[] = [];
  counts.forEach((count, ring) => {
    for (let i = 0; i < count; i++) rings.push(ring);
  });
  return rings.slice(0, n);
}

function skyCenter(view: ViewSize) {
  const usableTop = SKY_PAD.top;
  const usableBottom = view.h - SKY_PAD.bottom;
  return {
    cx: view.w / 2,
    cy: usableTop + (usableBottom - usableTop) / 2,
  };
}

export function skyFitsView(
  layout: SkyLayout,
  view: ViewSize,
  pad = SKY_PAD.side,
): boolean {
  return layout.planets.every((planet) => {
    return (
      planet.x - planet.r >= pad &&
      planet.x + planet.r <= view.w - pad &&
      planet.y - planet.r >= SKY_PAD.top - 24 &&
      planet.y + planet.r + 22 <= view.h - SKY_PAD.bottom + 16
    );
  });
}

function placePlanets(
  circles: MemoryCircle[],
  radii: number[],
  rings: { rx: number; ry: number }[],
  ringAssign: number[],
  perRing: number[],
  cx: number,
  cy: number,
): PlanetBody[] {
  const indexOnRing = Array.from({ length: rings.length }, () => 0);
  return circles.map((circle, i) => {
    const ring = ringAssign[i] ?? 0;
    const count = perRing[ring] || 1;
    const slot = indexOnRing[ring] ?? 0;
    indexOnRing[ring] = slot + 1;
    const ellipse = rings[ring] ?? rings[0]!;
    const stagger =
      rings.length > 1 ? (ring * Math.PI) / Math.max(count, 2) : 0;
    const baseAngle = -Math.PI / 2 + (Math.PI * 2 * slot) / count + stagger;
    const pos = ellipsePoint(cx, cy, ellipse.rx, ellipse.ry, baseAngle);
    const depth = 1 - ring * 0.05;
    return {
      id: circle.id,
      x: pos.x,
      y: pos.y,
      r: (radii[i] ?? 26) * depth,
      ring,
      rx: ellipse.rx,
      ry: ellipse.ry,
      baseAngle,
      period: ringPeriod(ring) * (circles.length <= 3 ? 1.28 : 1),
    };
  });
}

export function layoutSolarSky(
  circles: MemoryCircle[],
  view: ViewSize,
  zoom = 1,
): SkyLayout {
  const { cx, cy } = skyCenter(view);
  const youR = 34;
  const n = circles.length;
  const ringCount = planetRingCount(n, view.w);
  if (!n || !ringCount || view.w < 80 || view.h < 80) {
    return { cx, cy, youR, rings: [], planets: [] };
  }

  const radii = circles.map((circle) =>
    planetRadius(circle.memory_count, circle.is_loose),
  );
  let workingRadii = radii.map((radius) => {
    if (n <= 3) return Math.min(56, radius * 1.2);
    if (n >= 12) return radius * 0.88;
    return radius;
  });
  const maxPlanet = Math.max(...radii, 26);
  const ringAssign = assignPlanetRings(n, ringCount);
  const perRing = Array.from({ length: ringCount }, () => 0);
  ringAssign.forEach((ring) => {
    perRing[ring] = (perRing[ring] ?? 0) + 1;
  });

  const maxRx = Math.max(88, view.w / 2 - SKY_PAD.side - maxPlanet - 8);
  const maxRy = Math.max(
    72,
    (view.h - SKY_PAD.top - SKY_PAD.bottom) / 2 - maxPlanet - 20,
  );
  const outerRx = Math.min(maxRx, maxRy / ELLIPSE_RATIO);
  const innerRx = Math.min(
    outerRx * (ringCount === 1 ? 0.72 : 0.42),
    Math.max(youR + maxPlanet + 32, minRxForCount(perRing[0] || 1, maxPlanet)),
  );

  const rings = Array.from({ length: ringCount }, (_, i) => {
    const t = ringCount === 1 ? 1 : i / (ringCount - 1);
    const count = perRing[i] || 1;
    const needed = minRxForCount(count, maxPlanet);
    const rx = Math.min(
      outerRx,
      Math.max(innerRx, needed, innerRx + t * (outerRx - innerRx)),
    );
    return { rx, ry: rx * ELLIPSE_RATIO };
  });

  let planets = placePlanets(
    circles,
    workingRadii,
    rings,
    ringAssign,
    perRing,
    cx,
    cy,
  );

  let guard = 0;
  while (anyOverlap(planets, 12) && guard < 8) {
    const last = rings[rings.length - 1];
    if (last && last.rx * 1.06 <= outerRx) {
      rings.forEach((ring) => {
        ring.rx *= 1.05;
        ring.ry = ring.rx * ELLIPSE_RATIO;
      });
    } else {
      workingRadii = workingRadii.map((radius) => radius * 0.94);
    }
    planets = placePlanets(
      circles,
      workingRadii,
      rings,
      ringAssign,
      perRing,
      cx,
      cy,
    );
    guard += 1;
  }

  const scale = zoom;
  rings.forEach((ring) => {
    ring.rx *= scale;
    ring.ry *= scale;
  });
  planets.forEach((planet) => {
    planet.rx *= scale;
    planet.ry *= scale;
    planet.r *= 0.85 + 0.15 * scale;
    const pos = ellipsePoint(cx, cy, planet.rx, planet.ry, planet.baseAngle);
    planet.x = pos.x;
    planet.y = pos.y;
  });

  return { cx, cy, youR: youR * (0.9 + 0.1 * scale), rings, planets };
}

export function memoryStamp(memory: BankMemory): number {
  const iso = memory.occurred_on || memory.created_at.slice(0, 10);
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
}

export function isMemoryDim(
  memory: BankMemory,
  lastOpened: Record<string, string>,
  now = Date.now(),
): boolean {
  const stamp = lastOpened[memory.id] || memory.created_at;
  const time = Date.parse(stamp);
  if (Number.isNaN(time)) return false;
  return now - time > DIM_AFTER_MS;
}

function yearOf(stamp: number) {
  return new Date(stamp).getFullYear();
}

export function timeRingCount(memories: BankMemory[]): number {
  const n = memories.length;
  if (n <= 0) return 0;
  if (n === 1) return 1;
  const stamps = memories.map(memoryStamp);
  const min = Math.min(...stamps);
  const max = Math.max(...stamps);
  const spanDays = Math.max(0, (max - min) / 86_400_000);
  if (n <= 4 && spanDays < 90) return 1;
  if (spanDays < 14) return n > CLUSTER_AT * 2 ? 2 : 1;
  if (n >= 12 && spanDays > 365) return 4;
  if (n >= 8 && spanDays > 90) return 3;
  if (n >= 3) return 2;
  return 1;
}

function labelForSlice(slice: BankMemory[], index: number, total: number) {
  const newest = slice[0];
  const oldest = slice[slice.length - 1];
  if (!newest || !oldest) return "Memories";
  const a = memoryStamp(newest);
  const b = memoryStamp(oldest);
  const yearA = yearOf(a);
  const yearB = yearOf(b);
  if (total === 1) return "Now";
  if (index === 0)
    return yearA === new Date().getFullYear() ? "This year" : String(yearA);
  if (yearA === yearB) return String(yearA);
  if (index === total - 1) return "Older";
  return `${yearB}–${yearA}`;
}

export function quantileTimeRings(memories: BankMemory[]): {
  label: string;
  memories: BankMemory[];
}[] {
  const count = timeRingCount(memories);
  if (!count) return [];
  const sorted = memories
    .slice()
    .sort((a, b) => memoryStamp(b) - memoryStamp(a));
  if (count === 1) {
    return [{ label: labelForSlice(sorted, 0, 1), memories: sorted }];
  }
  const size = Math.ceil(sorted.length / count);
  const rings: { label: string; memories: BankMemory[] }[] = [];
  for (let i = 0; i < count; i++) {
    const slice = sorted.slice(i * size, (i + 1) * size);
    if (!slice.length) continue;
    rings.push({ label: labelForSlice(slice, i, count), memories: slice });
  }
  return rings;
}

function clusterMemories(memories: BankMemory[], expand: boolean) {
  if (expand || memories.length <= CLUSTER_AT) {
    return {
      shown: memories,
      cluster: null as BankMemory | null,
      hiddenCount: 0,
    };
  }
  const shown = memories.slice(0, CLUSTER_AT - 1);
  const rest = memories.slice(CLUSTER_AT - 1);
  return {
    shown,
    cluster: rest[0] ?? null,
    hiddenCount: rest.length,
  };
}

export function layoutSolarBank(
  memories: BankMemory[],
  view: ViewSize,
  lastOpened: Record<string, string> = {},
  options: { expandRing?: number | null; now?: number; zoom?: number } = {},
): BankSolarLayout {
  const { cx, cy } = skyCenter(view);
  const zoom = options.zoom ?? 1;
  const sunR = 44 * (0.9 + 0.1 * zoom);
  const buckets = quantileTimeRings(memories);
  const suggestList = memories.length > LIST_SUGGEST_AT;
  const now = options.now ?? Date.now();
  const fit = Math.min(
    view.w - SKY_PAD.side * 2,
    view.h - SKY_PAD.top - SKY_PAD.bottom,
  );
  const outer = (fit / 2) * 0.82 * zoom;

  if (!buckets.length) {
    return {
      cx,
      cy,
      sunR,
      rings: [],
      moons: [],
      suggestList,
      hiddenCount: 0,
    };
  }

  const rings = buckets.map((bucket, i) => {
    const t =
      buckets.length === 1
        ? 0.45
        : 0.28 + (i / Math.max(buckets.length - 1, 1)) * 0.62;
    return {
      r: Math.max(sunR + 52, outer * t),
      label: bucket.label,
    };
  });

  const moons: MoonBody[] = [];
  let hiddenCount = 0;

  buckets.forEach((bucket, ringIndex) => {
    const expand = options.expandRing === ringIndex;
    const clustered = clusterMemories(bucket.memories, expand);
    hiddenCount += clustered.hiddenCount;
    const visible = clustered.cluster
      ? [...clustered.shown, clustered.cluster]
      : clustered.shown;
    const ring = rings[ringIndex]!;
    const n = visible.length || 1;
    visible.forEach((memory, slot) => {
      const isCluster =
        Boolean(clustered.cluster) && memory.id === clustered.cluster?.id;
      const stagger = (ringIndex * Math.PI) / Math.max(n, 2);
      const baseAngle = -Math.PI / 2 + (Math.PI * 2 * slot) / n + stagger;
      const pos = ellipsePoint(cx, cy, ring.r, ring.r, baseAngle);
      moons.push({
        id: memory.id,
        x: pos.x,
        y: pos.y,
        r:
          (isCluster ? 22 : moonRadius(memory.id)) *
          (memories.length <= 4 ? 1.28 : 1),
        ring: ringIndex,
        label: ring.label,
        baseAngle,
        period: ringPeriod(ringIndex),
        dim: isMemoryDim(memory, lastOpened, now),
        clustered: isCluster,
        hiddenCount: isCluster ? clustered.hiddenCount : 0,
      });
    });
  });

  let guard = 0;
  while (anyOverlap(moons, 6) && guard < 10) {
    rings.forEach((ring, i) => {
      ring.r *= 1.06 + i * 0.01;
    });
    moons.forEach((moon) => {
      const ring = rings[moon.ring]!;
      const pos = ellipsePoint(cx, cy, ring.r, ring.r, moon.baseAngle);
      moon.x = pos.x;
      moon.y = pos.y;
    });
    guard += 1;
  }

  return { cx, cy, sunR, rings, moons, suggestList, hiddenCount };
}

export function orbitPoint(
  body: Pick<PlanetBody, "rx" | "ry" | "baseAngle" | "period">,
  cx: number,
  cy: number,
  t: number,
): { x: number; y: number } {
  const angle = body.baseAngle + (t / body.period) * Math.PI * 2;
  return ellipsePoint(cx, cy, body.rx, body.ry, angle);
}

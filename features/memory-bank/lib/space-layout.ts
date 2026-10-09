import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

export type SpaceBody = {
  id: string;
  x: number;
  y: number;
  r: number;
};

export type SpaceWorld = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  bodies: SpaceBody[];
};

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const MIN_MEMORY_R = 28;
const PAD = 420;

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(id: string, salt: number): number {
  return ((hash(id) + salt * 997) % 1000) / 1000;
}

export function bankRadius(
  circle: MemoryCircle,
  lastId: string | null,
): number {
  if (circle.is_loose) return 42;
  const base = 54 + Math.min(circle.memory_count, 24) * 1.35;
  return circle.id === lastId ? Math.min(base + 10, 88) : Math.min(base, 80);
}

export function memoryRadius(memory: BankMemory): number {
  const photos = memory.photos.length;
  return Math.max(MIN_MEMORY_R, Math.min(40, 28 + photos * 2));
}

/**
 * Scatter banks through a world larger than the viewport so the sky can be
 * panned. Last-opened sits nearer the camera; the loose pile trails the rest.
 */
export function layoutSky(
  circles: MemoryCircle[],
  lastId: string | null,
  view: { w: number; h: number },
): SpaceWorld {
  const named = circles.filter((circle) => !circle.is_loose);
  const last = lastId
    ? named.find((circle) => circle.id === lastId)
    : undefined;
  const rest = last ? named.filter((circle) => circle.id !== last.id) : named;
  const loose = circles.find((circle) => circle.is_loose);
  const ordered = [...(last ? [last] : []), ...rest, ...(loose ? [loose] : [])];

  const span = Math.max(view.w * 2.4, view.h * 2.4, 900 + ordered.length * 220);
  const width = Math.max(span, view.w + PAD * 2);
  const height = Math.max(span * 0.86, view.h + PAD * 2);
  const cx = width / 2;
  const cy = height / 2;

  if (!ordered.length) {
    return { width, height, cx, cy, bodies: [] };
  }

  const maxR = Math.min(width, height) * 0.28;
  const bodies: SpaceBody[] = ordered.map((circle, i) => {
    const t = ordered.length === 1 ? 0 : i / ordered.length;
    const r = 24 + maxR * Math.sqrt(t);
    const a = i * GOLDEN + unit(circle.id, 1) * 0.5;
    const wobble = 0.82 + unit(circle.id, 2) * 0.28;
    return {
      id: circle.id,
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r * wobble,
      r: bankRadius(circle, lastId),
    };
  });

  return { width, height, cx, cy, bodies };
}

/**
 * Memories burst from a bank that is already sitting in the sky. Positions are
 * world-absolute, around that bank's current x/y — not a new scene.
 */
export function layoutBurst(
  memories: BankMemory[],
  hub: { x: number; y: number; r: number },
): SpaceBody[] {
  const n = memories.length;
  if (!n) return [];
  const orbit = hub.r + 96 + Math.min(n, 16) * 9;
  return memories.map((memory, i) => {
    const base = -Math.PI / 2 + (Math.PI * 2 * i) / n;
    const jitter = (unit(memory.id, 3) - 0.5) * 0.5;
    const dist = orbit * (0.8 + unit(memory.id, 4) * 0.38) + (i % 4) * 14;
    return {
      id: memory.id,
      x: hub.x + Math.cos(base + jitter) * dist,
      y: hub.y + Math.sin(base + jitter) * dist * 0.9,
      r: memoryRadius(memory),
    };
  });
}

export function floatVars(id: string): {
  ["--mb-dx"]: string;
  ["--mb-dy"]: string;
  animationDuration: string;
  animationDelay: string;
} {
  const dx = 10 + unit(id, 6) * 16;
  const dy = 14 + unit(id, 7) * 18;
  const dur = 6 + unit(id, 8) * 5;
  const delay = unit(id, 9) * -dur;
  return {
    ["--mb-dx"]: `${unit(id, 10) > 0.5 ? dx : -dx}px`,
    ["--mb-dy"]: `${-dy}px`,
    animationDuration: `${dur}s`,
    animationDelay: `${delay}s`,
  };
}

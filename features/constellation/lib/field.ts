/**
 * The loose star field. Positions are the author's (or a local play layout).
 * Nothing here buckets memories by week or month.
 */

import type { Star } from "@/features/constellation/config";
import { storyOrder } from "@/features/constellation/lib/layout";

/** Viewport percent. About 48px on a phone, so a finger can still hit a star. */
export const MIN_GAP = 12;

/** Screen percent where the camera's y lands. Keeps the field in the sky. */
export const SKY_ANCHOR = 42;

export type FieldCamera = { x: number; y: number };

const round1 = (v: number) => Math.round(v * 10) / 10;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** 1 beside the camera, falling to a dim floor as a star slips away in either direction. */
export function fieldPresence(
  star: { x: number; y: number },
  cam: FieldCamera,
): number {
  const dist = Math.hypot(star.x - cam.x, (star.y - cam.y) * 1.2);
  const inner = 16;
  const outer = 48;
  if (dist <= inner) return 1;
  if (dist >= outer) return 0.18;
  const t = (dist - inner) / (outer - inner);
  const s = t * t * (3 - 2 * t);
  return 0.18 + 0.82 * (1 - s);
}

/** A star this dim is only a prick — its label and tap target sleep. */
export const PRESENCE_AWAKE = 0.55;

/** A photo glint only when you are close enough to recognise it. */
export const PRESENCE_GLINT = 0.75;

export function fieldBounds(stars: { x: number; y: number }[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  finale: FieldCamera;
} {
  if (stars.length === 0) {
    return {
      minX: 10,
      maxX: 90,
      minY: 12,
      maxY: 64,
      finale: { x: 72, y: 30 },
    };
  }
  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX: minX - 36,
    maxX: maxX + 48,
    minY: minY - 22,
    maxY: maxY + 22,
    finale: { x: round1(maxX + 26), y: round1((minY + maxY) / 2) },
  };
}

export function clampCamera(
  cam: FieldCamera,
  stars: { x: number; y: number }[],
): FieldCamera {
  const bounds = fieldBounds(stars);
  return {
    x: clamp(cam.x, bounds.minX, bounds.maxX),
    y: clamp(cam.y, bounds.minY, bounds.maxY),
  };
}

/** Where the camera rests: the oldest memory, or the newest on a return visit. */
export function cameraHome(stars: Star[], newest: boolean): FieldCamera {
  if (stars.length === 0) return { x: 50, y: 34 };
  const ordered = storyOrder(stars.filter((s) => !s.reply));
  const star = newest ? ordered[ordered.length - 1] : ordered[0];
  return { x: star?.x ?? 50, y: star?.y ?? 34 };
}

/** Screen percent for a star under this camera. Matches `starScreen`. */
export function screenOf(
  star: { x: number; y: number },
  cam: FieldCamera,
): { left: number; top: number } {
  return {
    left: 50 + (star.x - cam.x),
    top: SKY_ANCHOR + (star.y - cam.y),
  };
}

export function worldFromClient(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  cam: FieldCamera,
): { x: number; y: number } {
  return {
    x: round1(cam.x + ((clientX - rect.left) / rect.width) * 100 - 50),
    y: round1(
      clamp(
        cam.y + ((clientY - rect.top) / rect.height) * 100 - SKY_ANCHOR,
        8,
        72,
      ),
    ),
  };
}

/** A spot near the stars already placed, at least MIN_GAP from each. */
export function placeInGap(stars: Pick<Star, "x" | "y">[]): {
  x: number;
  y: number;
} {
  if (stars.length === 0) return { x: 50, y: 34 };
  const cx = stars.reduce((sum, star) => sum + star.x, 0) / stars.length;
  const cy = stars.reduce((sum, star) => sum + star.y, 0) / stars.length;
  for (let ring = 1; ring < 14; ring++) {
    const count = 6 + ring * 2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.4;
      const x = round1(cx + Math.cos(angle) * ring * MIN_GAP);
      const y = round1(
        clamp(cy + Math.sin(angle) * ring * MIN_GAP * 0.72, 10, 68),
      );
      const clear = stars.every(
        (star) => Math.hypot(star.x - x, star.y - y) >= MIN_GAP - 0.5,
      );
      if (clear) return { x, y };
    }
  }
  const last = stars[stars.length - 1]!;
  return { x: round1(last.x + MIN_GAP), y: last.y };
}

export function nearestStar(
  stars: Star[],
  at: { x: number; y: number },
): Star | null {
  let best: Star | null = null;
  let bestDist = Infinity;
  for (const star of stars) {
    const dist = Math.hypot(star.x - at.x, star.y - at.y);
    if (dist < bestDist) {
      best = star;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * A suggested scatter. Connections stay short, gaps stay wide, and older
 * memories drift a little to the left. The caller decides when to run it.
 */
export function looseArrange(stars: Star[], edges: [number, number][]): Star[] {
  if (stars.length === 0) return [];
  const order = storyOrder(stars);
  const pos = new Map<number, { x: number; y: number }>();
  order.forEach((star, i) => {
    const angle = i * 2.399963;
    const radius = MIN_GAP * 0.9 * Math.sqrt(i + 0.35);
    const age = order.length <= 1 ? 0.5 : i / (order.length - 1);
    pos.set(star.id, {
      x: 46 + Math.cos(angle) * radius - (1 - age) * 8,
      y: clamp(36 + Math.sin(angle) * radius * 0.68, 12, 66),
    });
  });

  const ids = stars.map((star) => star.id);
  for (let iter = 0; iter < 40; iter++) {
    const next = new Map(pos);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i]!;
        const b = ids[j]!;
        const pa = next.get(a)!;
        const pb = next.get(b)!;
        let dx = pb.x - pa.x;
        let dy = pb.y - pa.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist >= MIN_GAP) continue;
        const push = (MIN_GAP - dist) / 2;
        dx /= dist;
        dy /= dist;
        next.set(a, { x: pa.x - dx * push, y: pa.y - dy * push });
        next.set(b, { x: pb.x + dx * push, y: pb.y + dy * push });
      }
    }
    for (const [a, b] of edges) {
      const pa = next.get(a);
      const pb = next.get(b);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const rest = 20;
      if (dist <= rest) continue;
      const pull = (dist - rest) * 0.06;
      next.set(a, {
        x: pa.x + (dx / dist) * pull,
        y: pa.y + (dy / dist) * pull,
      });
      next.set(b, {
        x: pb.x - (dx / dist) * pull,
        y: pb.y - (dy / dist) * pull,
      });
    }
    pos.clear();
    for (const [id, point] of next) pos.set(id, point);
  }

  return stars.map((star) => {
    const point = pos.get(star.id);
    if (!point) return star;
    return { ...star, x: round1(point.x), y: round1(clamp(point.y, 10, 68)) };
  });
}

export type ReplyLine = { id: string; line: string; name: string };

function replyNumericId(key: string): number {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 800000 + (hash % 100000);
}

/** Faint stars for lines left in the sky. They are not part of the saved document. */
export function starsFromReplies(lines: ReplyLine[], authored: Star[]): Star[] {
  const placed: Pick<Star, "x" | "y">[] = authored.map((star) => ({
    x: star.x,
    y: star.y,
  }));
  return lines
    .filter((line) => line.line.trim())
    .map((line) => {
      const at = placeInGap(placed);
      placed.push(at);
      const name = line.name.trim();
      return {
        id: replyNumericId(line.id),
        x: at.x,
        y: at.y,
        size: "small" as const,
        label: name ? `${name} wrote back` : "a reply",
        date: "",
        memory: line.line.trim(),
        imageUrl: null,
        author: name,
        reply: true,
      };
    });
}

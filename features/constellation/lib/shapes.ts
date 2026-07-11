/**
 * Constellation — finale glyphs.
 *
 * The secret shape that ignites once every star is read. Each glyph is built as
 * a `Path2D` normalized into a unit box centred on the origin (roughly -0.5 →
 * 0.5 on both axes, y pointing down to match canvas), so the painter can place
 * it with a single translate + uniform scale.
 *
 * `Path2D` only exists in the browser, so nothing here runs at module load —
 * the engine resolves the glyph once inside its effect (client-side), never
 * during SSR import.
 */

import type { FinaleConfig } from "@/features/constellation/config";

export type ResolvedGlyph =
  | { kind: "path"; path: Path2D }
  | { kind: "text"; text: string }
  | null;

/** Turn the finale config into something paintable. */
export function resolveFinaleGlyph(finale: FinaleConfig): ResolvedGlyph {
  const glyph = finale.glyph;
  if (!glyph) return null;
  if (glyph === "initials") {
    return { kind: "text", text: finale.initials ?? "" };
  }
  if (glyph === "heart") return { kind: "path", path: heartPath() };
  if (glyph === "infinity") return { kind: "path", path: infinityPath() };
  // A custom SVG path string — author it in a unit box centred on the origin.
  return { kind: "path", path: new Path2D(glyph) };
}

type Pt = { x: number; y: number };

/** Fit a sampled curve into a centred unit box, preserving aspect ratio. */
function normalizedPath(points: Pt[]): Path2D {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const scale = 1 / Math.max(w, h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const path = new Path2D();
  points.forEach((p, i) => {
    const x = (p.x - cx) * scale;
    const y = (p.y - cy) * scale;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.closePath();
  return path;
}

/** Classic parametric heart, flipped so it sits upright on a y-down canvas. */
function heartPath(): Path2D {
  const pts: Pt[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    pts.push({ x, y });
  }
  return normalizedPath(pts);
}

/** A clean figure-eight (Gerono lemniscate). */
function infinityPath(): Path2D {
  const pts: Pt[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * Math.PI * 2;
    pts.push({ x: Math.cos(t), y: Math.sin(t) * Math.cos(t) });
  }
  return normalizedPath(pts);
}

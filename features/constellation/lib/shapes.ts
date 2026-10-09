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

/**
 * Places for the authored stars to stand when the finale shape is made of
 * them. Points sit in a centred unit box (about -0.5 → 0.5, y down). Call
 * this in the browser, once — it paints the glyph offscreen and reads it back.
 */
export function glyphSlots(
  finale: FinaleConfig,
  count: number,
): { x: number; y: number }[] {
  if (count <= 0 || typeof document === "undefined") return [];
  let glyph: ResolvedGlyph = null;
  try {
    glyph = resolveFinaleGlyph(finale);
  } catch {
    return [];
  }
  if (!glyph) return [];

  const size = 180;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  const scale = size * 0.62;
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (glyph.kind === "path") {
    ctx.scale(scale, scale);
    ctx.lineWidth = 16 / scale;
    ctx.stroke(glyph.path);
  } else if (glyph.text.trim()) {
    ctx.font = `600 ${Math.round(size * 0.34)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph.text.slice(0, 8), 0, 0);
  } else {
    return [];
  }

  const data = ctx.getImageData(0, 0, size, size).data;
  const unit = glyph.kind === "text" ? size * 0.28 : scale;
  const found: { x: number; y: number }[] = [];
  const step = 3;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if ((data[(y * size + x) * 4 + 3] ?? 0) < 48) continue;
      found.push({
        x: (x - size / 2) / unit,
        y: (y - size / 2) / unit,
      });
    }
  }
  if (found.length === 0) return [];
  found.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));

  const slots: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.min(
      found.length - 1,
      Math.floor(((i + 0.5) / count) * found.length),
    );
    const point = found[idx];
    if (point) slots.push(point);
  }
  return slots;
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

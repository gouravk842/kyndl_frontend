/**
 * Constellation — the dusk-meadow scene (pure canvas, no React).
 *
 * A backlit romantic landscape that sits under the starry sky: a warm sunset
 * glow on the horizon, the Milky Way overhead, layered mountain ridges, drifting
 * clouds, a tree, a couple on a blanket, and a field of grass + wildflowers that
 * sway in a slow wind. Everything is silhouette — near-black, lit from behind by
 * the sky — and everything is deterministic (seeded) so it never reshuffles.
 *
 * Generators build static geometry once; painters turn that geometry + a clock +
 * a wind value into pixels. The engine owns timing and draw order.
 */

import type { SceneConfig } from "@/features/constellation/config";
import { makeRng, type Vec } from "@/features/constellation/lib/sky";

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

// ── geometry generators (call once) ──────────────────────────────────

/** A jagged ridge as a list of heights (0–1, 1 = tallest) across the width. */
export function generateRidge(
  segments: number,
  seed: number,
  roughness: number,
): number[] {
  const rng = makeRng(seed);
  const pts: number[] = [];
  let h = 0.5;
  for (let i = 0; i <= segments; i++) {
    h += (rng() - 0.5) * roughness;
    h = Math.max(0.1, Math.min(1, h));
    pts.push(h);
  }
  return pts;
}

export type GrassBlade = {
  x: number; // 0–1 across width
  height: number; // 0–1 of the grass band height
  lean: number; // resting lean, radians
  width: number;
  phase: number; // wind phase offset
  flower: { hue: number; size: number } | null;
};

export function generateGrass(count: number, seed: number): GrassBlade[] {
  const rng = makeRng(seed);
  const blades: GrassBlade[] = [];
  for (let i = 0; i < count; i++) {
    const hasFlower = rng() < 0.12;
    blades.push({
      x: rng(),
      height: 0.45 + rng() * 0.55,
      lean: (rng() - 0.5) * 0.3,
      width: 1.2 + rng() * 1.8,
      phase: rng() * Math.PI * 2,
      flower: hasFlower
        ? { hue: 38 + rng() * 18, size: 1.6 + rng() * 1.4 }
        : null,
    });
  }
  // Draw shorter blades first so taller ones sit in front.
  return blades.sort((a, b) => a.height - b.height);
}

export type Cloud = {
  x: number; // 0–1
  y: number; // 0–1 of sky height
  scale: number;
  phase: number;
};

export function generateClouds(count: number, seed: number): Cloud[] {
  const rng = makeRng(seed);
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: rng(),
      y: 0.7 + rng() * 0.22,
      scale: 0.7 + rng() * 0.8,
      phase: rng() * Math.PI * 2,
    });
  }
  return clouds;
}

// ── painters ─────────────────────────────────────────────────────────

/** Warm sunset band hugging the horizon, brightest off to one side. */
export function paintHorizon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  glow: string,
  haze: string,
): void {
  const top = groundY - h * 0.42;
  const band = ctx.createLinearGradient(0, top, 0, groundY);
  band.addColorStop(0, withAlpha(haze, 0));
  band.addColorStop(0.55, withAlpha(haze, 0.28));
  band.addColorStop(1, withAlpha(glow, 0.5));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = band;
  ctx.fillRect(0, top, w, groundY - top);

  // a brighter sun-glow low on the right, like the reference
  const sx = w * 0.72;
  const sy = groundY - h * 0.04;
  const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.5);
  sun.addColorStop(0, withAlpha(glow, 0.55));
  sun.addColorStop(0.4, withAlpha(glow, 0.18));
  sun.addColorStop(1, withAlpha(glow, 0));
  ctx.fillStyle = sun;
  ctx.fillRect(0, top, w, groundY - top + h * 0.1);
  ctx.restore();
}

/** A soft luminous band of the galaxy arching down the sky. */
export function paintMilkyWay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduceMotion: boolean,
): void {
  const drift = reduceMotion ? 0 : Math.sin(t * 0.05) * 0.01;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // overlapping blobs from upper-left to lower-right
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const x = w * (0.32 + f * 0.34 + drift);
    const y = h * (-0.05 + f * 0.95);
    const r = w * (0.12 + Math.sin(f * Math.PI) * 0.06);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + Math.sin(f * Math.PI) * 0.05;
    g.addColorStop(0, `rgba(196, 208, 255, ${a})`);
    g.addColorStop(1, "rgba(196, 208, 255, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Soft warm-lit clouds near the horizon, drifting slowly with the wind. */
export function paintClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  clouds: Cloud[],
  t: number,
  windDrift: number,
  tint: string,
): void {
  ctx.save();
  for (const c of clouds) {
    const skyTop = groundY - h * 0.4;
    const cx = (((c.x + windDrift * 0.02 + 1) % 1) * w) | 0;
    const cy = skyTop + c.y * (groundY - skyTop) * 0.5;
    const rx = w * 0.16 * c.scale;
    const ry = rx * 0.32;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    const a = 0.18 + Math.sin(t * 0.1 + c.phase) * 0.04;
    g.addColorStop(0, withAlpha(tint, clamp01(a)));
    g.addColorStop(1, withAlpha(tint, 0));
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** Layered mountain ridges, back (hazy) to front (dark). */
export function paintMountains(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  ridge: number[],
  baseY: number,
  peak: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  const seg = w / (ridge.length - 1);
  ridge.forEach((hv, i) => {
    const x = i * seg;
    const y = baseY - hv * peak;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(w, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Fill everything below the horizon as dark ground. */
export function paintGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, groundY, w, h - groundY);
}

/** A silhouette tree whose canopy sways gently with the wind. */
export function paintTree(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  groundY: number,
  scale: number,
  sway: number,
  color: string,
): void {
  const trunkH = 120 * scale;
  const trunkW = 10 * scale;
  ctx.save();
  ctx.fillStyle = color;
  // trunk
  ctx.beginPath();
  ctx.moveTo(baseX - trunkW / 2, groundY);
  ctx.lineTo(baseX - trunkW * 0.3, groundY - trunkH);
  ctx.lineTo(baseX + trunkW * 0.3, groundY - trunkH);
  ctx.lineTo(baseX + trunkW / 2, groundY);
  ctx.closePath();
  ctx.fill();

  // canopy — a cluster of blobs, swaying as one
  const cx = baseX + sway * 8 * scale;
  const cy = groundY - trunkH - 38 * scale;
  const blobs: Vec[] = [
    { x: 0, y: 0 },
    { x: -34, y: 10 },
    { x: 32, y: 8 },
    { x: -16, y: -26 },
    { x: 18, y: -22 },
  ];
  for (const b of blobs) {
    ctx.beginPath();
    ctx.arc(cx + b.x * scale, cy + b.y * scale, 34 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Two people sitting close together on a blanket, in silhouette. */
export function paintCouple(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  scale: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;

  // blanket
  ctx.beginPath();
  ctx.ellipse(
    cx,
    groundY + 4 * scale,
    95 * scale,
    16 * scale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const figure = (fx: number, lean: number, size: number) => {
    // seated body — a rounded hump
    ctx.beginPath();
    ctx.moveTo(fx - 22 * size, groundY);
    ctx.quadraticCurveTo(
      fx - 20 * size,
      groundY - 58 * size,
      fx + lean,
      groundY - 64 * size,
    );
    ctx.quadraticCurveTo(
      fx + 22 * size,
      groundY - 52 * size,
      fx + 24 * size,
      groundY,
    );
    ctx.closePath();
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(fx + lean, groundY - 76 * size, 12 * size, 0, Math.PI * 2);
    ctx.fill();
  };

  // two figures leaning toward each other
  figure(cx - 26 * scale, 8 * scale, scale);
  figure(cx + 26 * scale, -8 * scale, scale);
  ctx.restore();
}

/** The foreground grass + wildflowers, swaying in the wind. */
export function paintGrass(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  bandHeight: number,
  blades: GrassBlade[],
  t: number,
  windPhase: number,
  gust: number,
  reduceMotion: boolean,
  silhouette: string,
  flowerColor: string,
): void {
  ctx.save();
  ctx.strokeStyle = silhouette;
  ctx.lineCap = "round";

  for (const blade of blades) {
    const x = blade.x * w;
    const baseY = h - 2;
    const bladeH = blade.height * bandHeight;
    const sway = reduceMotion
      ? blade.lean
      : blade.lean + Math.sin(windPhase + blade.phase) * 0.32 * gust;
    const tipX = x + Math.sin(sway) * bladeH * 0.5;
    const tipY = baseY - bladeH;
    const ctrlX = x + Math.sin(sway) * bladeH * 0.28;
    const ctrlY = baseY - bladeH * 0.55;

    ctx.lineWidth = blade.width;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
    ctx.stroke();

    if (blade.flower) {
      const r = blade.flower.size;
      const fg = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, r * 3);
      const warm = `hsla(${blade.flower.hue}, 80%, 70%, 0.9)`;
      fg.addColorStop(0, warm);
      fg.addColorStop(1, withAlphaFromHsl(flowerColor));
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(tipX, tipY, r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = warm;
      ctx.beginPath();
      ctx.arc(tipX, tipY, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Resolve the scene's ground line in pixels. */
export function groundLevelPx(scene: SceneConfig, h: number): number {
  return (scene.groundLevel / 100) * h;
}

// ── colour helpers (kept local; sky.ts keeps its own copies private) ──

function withAlpha(color: string, alpha: number): string {
  const c = color.trim();
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex && hex[1]) {
    const n = parseInt(hex[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${clamp01(alpha)})`;
  }
  const fn = c.match(/^rgba?\(([^)]+)\)$/i);
  if (fn && fn[1]) {
    const parts = fn[1].split(",").map((p) => parseFloat(p.trim()));
    const [r, g, b] = parts;
    if (r !== undefined && g !== undefined && b !== undefined) {
      return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
    }
  }
  return color;
}

/** Force the transparent edge stop for a flower glow regardless of input format. */
function withAlphaFromHsl(color: string): string {
  return color.startsWith("hsl")
    ? color.replace(/[\d.]+\)$/, "0)")
    : withAlpha(color, 0);
}

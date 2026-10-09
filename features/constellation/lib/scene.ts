/**
 * Constellation — the night meadow scene (pure canvas, no React).
 *
 * A high-contrast silhouette under a vast starfield, inspired by lying in the
 * grass and pointing at constellations: dark ground, soft silver horizon haze
 * (no warm sunset wash), layered ridges, and two figures on their backs with
 * arms raised into the sky. Everything is near-black, lit from above by the
 * stars — photographic night, not a cartoon dusk. Generators are seeded so the
 * scene never reshuffles on resize.
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
    // Sparse silver dew-points instead of bright wildflowers — monochrome night.
    const hasDew = rng() < 0.06;
    blades.push({
      x: rng(),
      height: 0.4 + rng() * 0.6,
      lean: (rng() - 0.5) * 0.28,
      width: 1.0 + rng() * 1.6,
      phase: rng() * Math.PI * 2,
      flower: hasDew
        ? { hue: 210 + rng() * 20, size: 1.1 + rng() * 0.9 }
        : null,
    });
  }
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
      y: 0.72 + rng() * 0.2,
      scale: 0.7 + rng() * 0.8,
      phase: rng() * Math.PI * 2,
    });
  }
  return clouds;
}

// ── painters ─────────────────────────────────────────────────────────

/** Cool silver haze hugging the horizon — starlight, not sunset. */
export function paintHorizon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  glow: string,
  haze: string,
): void {
  const top = groundY - h * 0.12;
  const band = ctx.createLinearGradient(0, top, 0, groundY);
  band.addColorStop(0, withAlpha(haze, 0));
  band.addColorStop(0.6, withAlpha(haze, 0.14));
  band.addColorStop(1, withAlpha(glow, 0.22));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = band;
  ctx.fillRect(0, top, w, groundY - top);

  // soft pool of starlight low and centred — like the sky lighting the meadow
  const sx = w * 0.5;
  const sy = groundY - h * 0.02;
  const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.42);
  sun.addColorStop(0, withAlpha(glow, 0.2));
  sun.addColorStop(0.45, withAlpha(glow, 0.06));
  sun.addColorStop(1, withAlpha(glow, 0));
  ctx.fillStyle = sun;
  ctx.fillRect(0, top, w, groundY - top + h * 0.08);
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
  const steps = 9;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const x = w * (0.28 + f * 0.4 + drift);
    const y = h * (-0.02 + f * 0.72);
    const r = w * (0.1 + Math.sin(f * Math.PI) * 0.07);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.035 + Math.sin(f * Math.PI) * 0.045;
    g.addColorStop(0, `rgba(210, 220, 240, ${a})`);
    g.addColorStop(1, "rgba(210, 220, 240, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Soft cool-lit clouds near the horizon, drifting slowly with the wind. */
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
    const skyTop = groundY - h * 0.14;
    const cx = (((c.x + windDrift * 0.02 + 1) % 1) * w) | 0;
    const cy = skyTop + c.y * (groundY - skyTop) * 0.5;
    const rx = w * 0.16 * c.scale;
    const ry = rx * 0.32;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    const a = 0.1 + Math.sin(t * 0.1 + c.phase) * 0.03;
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
  const trunkH = 110 * scale;
  const trunkW = 9 * scale;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(baseX - trunkW / 2, groundY);
  ctx.lineTo(baseX - trunkW * 0.3, groundY - trunkH);
  ctx.lineTo(baseX + trunkW * 0.3, groundY - trunkH);
  ctx.lineTo(baseX + trunkW / 2, groundY);
  ctx.closePath();
  ctx.fill();

  const cx = baseX + sway * 8 * scale;
  const cy = groundY - trunkH - 34 * scale;
  const blobs: Vec[] = [
    { x: 0, y: 0 },
    { x: -30, y: 8 },
    { x: 28, y: 6 },
    { x: -14, y: -22 },
    { x: 16, y: -18 },
  ];
  for (const b of blobs) {
    ctx.beginPath();
    ctx.arc(cx + b.x * scale, cy + b.y * scale, 30 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Two people lying in the grass at the bottom edge of the frame — heads
 * nearest the camera, bodies low, one arm each lifted into the sky. The
 * gesture is the childhood one: on your back, pointing at a star.
 */
export function paintCouple(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  scale: number,
  color: string,
  frameH: number,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const grassDepth = Math.max(frameH - groundY, 24 * scale);
  // Heads rest in the grass, close to the bottom of what you can see.
  const headY = groundY + grassDepth * 0.62;

  const figure = (side: number) => {
    const fx = cx + side * 34 * scale;
    const headX = fx + side * 2 * scale;
    const shoulderX = fx - side * 2 * scale;
    const shoulderY = headY - 16 * scale;
    const hipX = fx - side * 10 * scale;
    const hipY = groundY + grassDepth * 0.22;

    // body, lying back, small against the sky
    ctx.beginPath();
    ctx.moveTo(headX - 8 * scale, headY - 2 * scale);
    ctx.quadraticCurveTo(shoulderX - side * 6 * scale, shoulderY, hipX, hipY);
    ctx.quadraticCurveTo(
      hipX + side * 14 * scale,
      hipY + 4 * scale,
      shoulderX + side * 10 * scale,
      shoulderY + 2 * scale,
    );
    ctx.quadraticCurveTo(
      headX + 9 * scale,
      headY,
      headX - 8 * scale,
      headY - 2 * scale,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(headX, headY + 1 * scale, 7.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // arm raised into the open sky, fingertip above the horizon
    const tipX = fx + side * 22 * scale;
    const tipY = groundY - 120 * scale;
    ctx.lineWidth = 4.2 * scale;
    ctx.beginPath();
    ctx.moveTo(shoulderX + side * 4 * scale, shoulderY - 2 * scale);
    ctx.quadraticCurveTo(
      fx + side * 10 * scale,
      groundY - 36 * scale,
      tipX,
      tipY,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tipX, tipY - 2 * scale, 2.6 * scale, 0, Math.PI * 2);
    ctx.fill();
  };

  figure(-1);
  figure(1);
  ctx.restore();
}

/** The foreground grass, swaying in the wind; sparse silver dew on tips. */
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
      : blade.lean + Math.sin(windPhase + blade.phase) * 0.28 * gust;
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
      const fg = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, r * 2.6);
      fg.addColorStop(0, "rgba(220, 230, 245, 0.55)");
      fg.addColorStop(1, withAlpha(flowerColor, 0));
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(tipX, tipY, r * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(230, 236, 248, 0.75)";
      ctx.beginPath();
      ctx.arc(tipX, tipY, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** A flat roof, a water tank, and two figures sitting on the parapet. */
export function paintRooftop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.fillRect(0, groundY - h * 0.035, w, h * 0.012);
  const tankX = w * 0.78;
  const tankW = w * 0.07;
  const tankH = h * 0.045;
  ctx.fillRect(tankX, groundY - tankH, tankW, tankH);
  ctx.fillRect(
    tankX + tankW * 0.35,
    groundY - tankH - h * 0.012,
    tankW * 0.12,
    h * 0.012,
  );
  const seat = groundY - h * 0.012;
  const person = (x: number) => {
    ctx.beginPath();
    ctx.arc(x, seat - h * 0.028, h * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - h * 0.01, seat - h * 0.016, h * 0.02, h * 0.018);
  };
  person(w * 0.46);
  person(w * 0.52);
  ctx.restore();
}

/** Sand, a quiet waterline, and one palm. */
export function paintShore(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  color: string,
  t: number,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  const wave = Math.sin(t * 0.6) * h * 0.004;
  for (let x = 0; x <= w; x += 16) {
    ctx.lineTo(
      x,
      groundY - h * 0.012 + Math.sin(x * 0.02 + t) * h * 0.004 + wave,
    );
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  const palmX = w * 0.12;
  ctx.fillRect(palmX, groundY - h * 0.09, w * 0.006, h * 0.09);
  ctx.beginPath();
  ctx.ellipse(
    palmX + w * 0.01,
    groundY - h * 0.1,
    w * 0.035,
    h * 0.012,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
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

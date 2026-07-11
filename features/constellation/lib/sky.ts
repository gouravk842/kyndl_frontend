/**
 * Constellation — pure canvas helpers.
 *
 * Nothing here touches React or the DOM beyond a 2D context. The engine hook
 * owns timing and state; these functions just turn the config + a clock into
 * pixels. All drawing is done in CSS pixels — the hook scales the context for
 * devicePixelRatio, so `w`/`h` below are layout sizes, not backing-store sizes.
 */

import type {
  SkyConfig,
  Star,
  StarSize,
} from "@/features/constellation/config";

export type Vec = { x: number; y: number };

/** ms the sky takes to assemble itself on first paint. */
export const ENTRANCE_MS = 3200;

/**
 * Deterministic PRNG (mulberry32). We seed the background starfield so it's
 * identical every render — a twinkling sky that reshuffled on each resize would
 * feel broken. Returns a function yielding floats in [0, 1).
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** The faint scatter of fixed stars behind the constellation. Normalized 0–1. */
export type BgStar = {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleAmp: number;
  twinkleSpeed: number;
  phase: number;
};

export function generateBackgroundStars(
  count: number,
  rng: () => number,
): BgStar[] {
  const stars: BgStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rng(),
      y: rng(),
      radius: 0.4 + rng() * 1.1,
      baseAlpha: 0.15 + rng() * 0.5,
      twinkleAmp: 0.1 + rng() * 0.35,
      twinkleSpeed: 0.4 + rng() * 1.6,
      phase: rng() * Math.PI * 2,
    });
  }
  return stars;
}

/** A streak crossing the sky. Position/velocity are in CSS px. */
export type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  /** A "wish" star she can tap to catch — slower and longer-lived than normal. */
  catchable: boolean;
};

export function spawnShootingStar(
  rng: () => number,
  w: number,
  catchable = false,
): ShootingStar {
  // Always travelling down-and-across, entering from the top edge. A catchable
  // wish star drifts slower and lingers, so it's actually possible to tap.
  const angle = Math.PI * (0.18 + rng() * 0.18); // ~32°–65° below horizon
  const speed = catchable ? 150 + rng() * 90 : 480 + rng() * 360;
  return {
    x: rng() * w * 0.9,
    y: -20,
    vx: Math.cos(angle) * speed * (rng() < 0.5 ? 1 : -1),
    vy: Math.sin(angle) * speed,
    length: catchable ? 120 : 90 + rng() * 80,
    life: 0,
    maxLife: catchable ? 4 + rng() : 0.9 + rng() * 0.5,
    catchable,
  };
}

const STAR_RADIUS: Record<StarSize, number> = {
  small: 2.4,
  medium: 3.4,
  large: 4.6,
};

/** Generous tap target so stars are easy to hit on touch — used by the hit layer. */
export function hitRadius(size: StarSize): number {
  return STAR_RADIUS[size] + 18;
}

/** Percent coordinates → device-independent pixels. */
export function starToPixel(star: Star, w: number, h: number): Vec {
  return { x: (star.x / 100) * w, y: (star.y / 100) * h };
}

/** The drawn shape: explicit edges if given, else a sequential 1→2→3 path. */
export function edgesOf(config: SkyConfig): [number, number][] {
  if (config.customEdges && config.customEdges.length > 0) {
    return config.customEdges;
  }
  const edges: [number, number][] = [];
  for (let i = 0; i < config.stars.length - 1; i++) {
    const a = config.stars[i];
    const b = config.stars[i + 1];
    if (a && b) edges.push([a.id, b.id]);
  }
  return edges;
}

/** Visual centroid of the named stars — the nebula glows here. Percent space. */
export function constellationCenter(config: SkyConfig): Vec {
  const { stars } = config;
  if (stars.length === 0) return { x: 50, y: 50 };
  const sum = stars.reduce((acc, s) => ({ x: acc.x + s.x, y: acc.y + s.y }), {
    x: 0,
    y: 0,
  });
  return { x: sum.x / stars.length, y: sum.y / stars.length };
}

/**
 * The virtual camera the guided tour flies around. `x`/`y` is the world point
 * (CSS px) held at screen centre; `zoom` magnifies around it. Identity — the
 * whole sky framed 1:1 — is `{ x: w/2, y: h/2, zoom: 1 }`.
 */
export type Camera = { x: number; y: number; zoom: number };

export function identityCamera(w: number, h: number): Camera {
  return { x: w / 2, y: h / 2, zoom: 1 };
}

/** Concatenate the camera transform onto the current (dpr-scaled) context. */
export function applyCamera(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
): void {
  ctx.translate(w / 2, h / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);
}

// ── painters ──────────────────────────────────────────────────────────

export function paintSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: SkyConfig,
): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, config.skyColors.top);
  g.addColorStop(0.55, config.skyColors.middle);
  g.addColorStop(1, config.skyColors.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function paintNebula(
  ctx: CanvasRenderingContext2D,
  center: Vec,
  w: number,
  h: number,
  color: string,
  intensity: number,
  offset: Vec = { x: 0, y: 0 },
): void {
  const cx = (center.x / 100) * w + offset.x;
  const cy = (center.y / 100) * h + offset.y;
  const r = Math.max(w, h) * 0.5;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, withAlpha(color, 0.5 * intensity));
  g.addColorStop(0.4, withAlpha(color, 0.22 * intensity));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function paintBackgroundStars(
  ctx: CanvasRenderingContext2D,
  stars: BgStar[],
  w: number,
  h: number,
  t: number,
  reduceMotion: boolean,
  offset: Vec = { x: 0, y: 0 },
): void {
  for (const s of stars) {
    const twinkle = reduceMotion
      ? 0
      : Math.sin(t * s.twinkleSpeed + s.phase) * s.twinkleAmp;
    const alpha = clamp01(s.baseAlpha + twinkle);
    ctx.beginPath();
    ctx.arc(s.x * w + offset.x, s.y * h + offset.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 252, 244, ${alpha})`;
    ctx.fill();
  }
}

/**
 * One line of the constellation, resolved to pixels by the engine. `litAmount`
 * (0–1) is how much of the edge is drawn at full strength — the "earned" line
 * that grows in once both its stars are read; `ghostAlpha` (0–1) fades a faint
 * full-length preview that hints the shape before it's earned.
 */
export type EdgeRender = {
  from: Vec;
  to: Vec;
  litAmount: number;
  ghostAlpha: number;
};

const GHOST_ALPHA = 0.07;

/**
 * Draw the lines. The engine decides each edge's lit/ghost state (per the
 * opened set and entrance timing); here we just stroke pixels. `shimmer` (0–1)
 * brightens the lit lines in the finale.
 */
export function paintEdges(
  ctx: CanvasRenderingContext2D,
  edges: EdgeRender[],
  lineStyle: SkyConfig["lineStyle"],
  lineColor: string,
  shimmer: number,
  dashOffset: number,
): void {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  if (lineStyle === "dashed") ctx.setLineDash([6, 7]);
  else if (lineStyle === "dotted") ctx.setLineDash([0.5, 7]);
  ctx.lineDashOffset = -dashOffset;

  const litColor = brightenLine(lineColor, shimmer);

  for (const e of edges) {
    if (e.ghostAlpha > 0) {
      ctx.strokeStyle = withAlpha(lineColor, GHOST_ALPHA * e.ghostAlpha);
      ctx.beginPath();
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(e.to.x, e.to.y);
      ctx.stroke();
    }
    if (e.litAmount > 0) {
      ctx.strokeStyle = litColor;
      ctx.beginPath();
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(
        lerp(e.from.x, e.to.x, e.litAmount),
        lerp(e.from.y, e.to.y, e.litAmount),
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * The secret shape that ignites at the finale, centred over the constellation.
 * `alpha` (0–1) ramps it in. A path glyph is stroked with a glow; initials are
 * drawn as glowing serif text.
 */
export function paintHiddenShape(
  ctx: CanvasRenderingContext2D,
  glyph: { kind: "path"; path: Path2D } | { kind: "text"; text: string },
  centerPx: Vec,
  sizePx: number,
  alpha: number,
  color: string,
): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = withAlpha(color, alpha);
  ctx.shadowBlur = sizePx * 0.25;

  if (glyph.kind === "path") {
    ctx.translate(centerPx.x, centerPx.y);
    ctx.scale(sizePx, sizePx);
    ctx.lineWidth = 2.4 / sizePx;
    ctx.lineJoin = "round";
    ctx.strokeStyle = withAlpha(color, alpha);
    ctx.stroke(glyph.path);
  } else {
    ctx.translate(centerPx.x, centerPx.y);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${sizePx}px var(--font-serif), Georgia, serif`;
    ctx.fillStyle = withAlpha(color, alpha);
    ctx.fillText(glyph.text, 0, 0);
  }
  ctx.restore();
}

export type StarPaintState = {
  appear: number; // 0–1 entrance progress for this star
  opened: boolean;
  hovered: boolean;
  active: boolean;
  t: number;
};

export function paintStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  w: number,
  h: number,
  state: StarPaintState,
): void {
  if (state.appear <= 0) return;
  const { x, y } = starToPixel(star, w, h);
  const ease = easeOutCubic(state.appear);
  const base = STAR_RADIUS[star.size];

  // An opened star keeps a warm gold; an untouched one is cool starlight. The
  // hovered/active star swells and brightens to invite (and confirm) the tap.
  const warm = state.opened;
  const twinkle = 0.85 + Math.sin(state.t * 1.4 + star.id) * 0.15;
  const emphasis = state.active ? 1.6 : state.hovered ? 1.3 : 1;
  const radius = base * emphasis * ease;
  const glowRadius = radius * (warm ? 7 : 5.5) * (state.hovered ? 1.25 : 1);
  const coreColor = warm ? "255, 226, 168" : "224, 238, 255";
  const glowAlpha =
    (warm ? 0.5 : 0.32) * ease * (state.active ? 1.4 : 1) * twinkle;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, `rgba(${coreColor}, ${clamp01(glowAlpha)})`);
  glow.addColorStop(1, `rgba(${coreColor}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // bright core
  ctx.fillStyle = `rgba(255, 252, 246, ${clamp01(ease * twinkle)})`;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // a thin ring on the active star, like the memory is being held open
  if (state.active) {
    ctx.strokeStyle = `rgba(${coreColor}, ${0.6 * ease})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function paintShootingStar(
  ctx: CanvasRenderingContext2D,
  s: ShootingStar,
): void {
  const life = clamp01(s.life / s.maxLife);
  const fade = Math.sin(life * Math.PI); // ease in then out
  const speed = Math.hypot(s.vx, s.vy) || 1;
  const tailX = s.x - (s.vx / speed) * s.length;
  const tailY = s.y - (s.vy / speed) * s.length;

  const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
  g.addColorStop(0, `rgba(255, 250, 240, ${0.9 * fade})`);
  g.addColorStop(1, "rgba(255, 250, 240, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = g;
  ctx.lineWidth = s.catchable ? 2.2 : 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(tailX, tailY);
  ctx.stroke();

  // A catchable wish star carries a soft pulsing head so she knows to reach.
  if (s.catchable) {
    const headR = 7 * fade;
    const head = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, headR * 2.5);
    head.addColorStop(0, `rgba(255, 244, 214, ${0.9 * fade})`);
    head.addColorStop(1, "rgba(255, 244, 214, 0)");
    ctx.fillStyle = head;
    ctx.beginPath();
    ctx.arc(s.x, s.y, headR * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── colour utilities ─────────────────────────────────────────────────

/** Replace the alpha of an rgb()/rgba()/#hex colour. */
function withAlpha(color: string, alpha: number): string {
  const rgb = toRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clamp01(alpha)})`;
}

/** Lift a line colour's alpha toward 1 by `amount` (0–1) for the finale glow. */
function brightenLine(color: string, amount: number): string {
  const rgba = toRgba(color);
  if (!rgba) return color;
  const [r, g, b, a] = rgba;
  return `rgba(${r}, ${g}, ${b}, ${clamp01(a + (1 - a) * amount * 0.9)})`;
}

function toRgb(color: string): [number, number, number] | null {
  const rgba = toRgba(color);
  return rgba ? [rgba[0], rgba[1], rgba[2]] : null;
}

function toRgba(color: string): [number, number, number, number] | null {
  const c = color.trim();
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex && hex[1]) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const fn = c.match(/^rgba?\(([^)]+)\)$/i);
  if (fn && fn[1]) {
    const parts = fn[1].split(",").map((p) => parseFloat(p.trim()));
    const [r, g, b, a = 1] = parts;
    if (r !== undefined && g !== undefined && b !== undefined) {
      return [r, g, b, a];
    }
  }
  return null;
}

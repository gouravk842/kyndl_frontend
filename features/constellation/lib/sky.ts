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
    // Heavy-tailed sizes: mostly pinpricks, a few soft luminous "near" stars —
    // matches a photographic night sky rather than a uniform sprinkle.
    const roll = rng();
    const radius =
      roll > 0.97
        ? 1.8 + rng() * 1.6
        : roll > 0.85
          ? 1.0 + rng() * 0.8
          : 0.35 + rng() * 0.7;
    stars.push({
      // Bias density into the upper sky so the ground silhouette stays darker.
      x: rng(),
      y: rng() * 0.78,
      radius,
      baseAlpha: 0.12 + rng() * (radius > 1.4 ? 0.55 : 0.4),
      twinkleAmp: 0.08 + rng() * 0.32,
      twinkleSpeed: 0.35 + rng() * 1.5,
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
  small: 1.8,
  medium: 3.2,
  large: 5.2,
};

/** Generous tap target so stars are easy to hit on touch — used by the hit layer. */
export function hitRadius(size: StarSize): number {
  return STAR_RADIUS[size] + 18;
}

/** Percent coordinates → device-independent pixels. */
export function starToPixel(star: Star, w: number, h: number): Vec {
  return { x: (star.x / 100) * w, y: (star.y / 100) * h };
}

/**
 * A star in the loose field. `camera.x` / `camera.y` are the world point held
 * at screen centre (x) and at the sky anchor (y). A bare number is the older
 * horizontal scroll, kept so a one-axis caller still paints.
 */
export function starScreen(
  star: Pick<Star, "x" | "y">,
  w: number,
  h: number,
  camera: number | { x: number; y: number },
): Vec {
  if (typeof camera === "number") {
    return {
      x: w / 2 + ((star.x - camera) / 100) * w,
      y: (star.y / 100) * h,
    };
  }
  return {
    x: w / 2 + ((star.x - camera.x) / 100) * w,
    y: h * 0.42 + ((star.y - camera.y) / 100) * h,
  };
}

/** The drawn shape: explicit edges if given, else a sequential 1→2→3 path. */
export function edgesOf(config: SkyConfig): [number, number][] {
  // An explicit list, even empty, is the author's choice. Only skies that
  // never stored edges fall back to a path through story order.
  if (config.customEdges) return config.customEdges;
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
  /** 0–1 brightness. Distant figures in a grouped sky stay visible but dim. */
  presence?: number;
};

const GHOST_ALPHA = 0.11;

/**
 * Draw the lines. The engine decides each edge's lit/ghost state (per the
 * opened set and entrance timing); here we just stroke pixels. `shimmer` (0–1)
 * brightens the lit lines in the finale. Soft outer glow + hairline core keep
 * the asterism elegant against a deep black sky.
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
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (lineStyle === "dashed") ctx.setLineDash([5, 9]);
  else if (lineStyle === "dotted") ctx.setLineDash([0.6, 8]);
  ctx.lineDashOffset = -dashOffset;

  const litColor = brightenLine(lineColor, shimmer);

  for (const e of edges) {
    const presence = e.presence ?? 1;
    if (presence <= 0.01) continue;
    if (e.ghostAlpha > 0) {
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = withAlpha(
        lineColor,
        GHOST_ALPHA * e.ghostAlpha * presence,
      );
      ctx.beginPath();
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(e.to.x, e.to.y);
      ctx.stroke();
    }
    if (e.litAmount > 0) {
      const tx = lerp(e.from.x, e.to.x, e.litAmount);
      const ty = lerp(e.from.y, e.to.y, e.litAmount);

      // soft bloom under the stroke
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = withAlpha(lineColor, (0.18 + shimmer * 0.2) * presence);
      ctx.beginPath();
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();

      ctx.lineWidth = 1.05;
      ctx.strokeStyle = scaleAlpha(litColor, presence);
      ctx.beginPath();
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // A spark rides the leading end while the line is still growing in.
      if (e.litAmount > 0.04 && e.litAmount < 0.98) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = withAlpha(litColor, 0.9 * presence);
        ctx.beginPath();
        ctx.arc(tx, ty, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

/**
 * A breath of light between an open memory and a star it belongs with.
 * Not a line — a wash that fades when the memory closes.
 */
export function paintKinship(
  ctx: CanvasRenderingContext2D,
  from: Vec,
  to: Vec,
  alpha: number,
  color: string,
): void {
  if (alpha <= 0.01) return;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const radius = Math.max(56, dist * 0.62);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const wash = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
  wash.addColorStop(0, withAlpha(color, 0.2 * alpha));
  wash.addColorStop(0.5, withAlpha(color, 0.07 * alpha));
  wash.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.arc(mx, my, radius, 0, Math.PI * 2);
  ctx.fill();
  const kin = ctx.createRadialGradient(to.x, to.y, 0, to.x, to.y, 42);
  kin.addColorStop(0, withAlpha(color, 0.38 * alpha));
  kin.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = kin;
  ctx.beginPath();
  ctx.arc(to.x, to.y, 42, 0, Math.PI * 2);
  ctx.fill();
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
  /** Screen position. Falls back to treating x/y as viewport percent. */
  at?: Vec;
  /** 1 → 0 ring that blooms when the star is opened. */
  flare?: number;
  /** A photo, drawn as a small disc when the camera is close. */
  glint?: CanvasImageSource | null;
  /** A reply star — quieter than a memory. */
  reply?: boolean;
  /** Extra warmth left after the stars have stood in the finale shape. */
  ember?: number;
};

export function paintStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  w: number,
  h: number,
  state: StarPaintState,
): void {
  if (state.appear <= 0) return;
  const { x, y } = state.at ?? starToPixel(star, w, h);
  const ease = easeOutCubic(state.appear);
  const base = STAR_RADIUS[star.size];

  // Opened memories warm to soft gold; unread ones stay cool silver-white —
  // high contrast against the deep black sky of the reference.
  const warm = state.opened;
  const twinkle = 0.82 + Math.sin(state.t * 1.35 + star.id * 1.7) * 0.18;
  const ember = state.ember ?? 0;
  const emphasis = state.active ? 1.55 : state.hovered ? 1.28 : 1;
  const radius = base * emphasis * ease * (1 + ember * 0.18);
  const glowRadius =
    radius *
    (warm ? 8.5 : 6.5) *
    (state.hovered ? 1.3 : 1) *
    (1 + ember * 0.45);
  const coreColor = warm || ember > 0.2 ? "255, 228, 176" : "248, 250, 255";
  const glowAlpha =
    (warm ? 0.55 : 0.38) *
    (1 + ember * 0.65) *
    ease *
    (state.active ? 1.35 : 1) *
    twinkle *
    (state.reply ? 0.55 : 1);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, `rgba(${coreColor}, ${clamp01(glowAlpha)})`);
  glow.addColorStop(0.45, `rgba(${coreColor}, ${clamp01(glowAlpha * 0.22)})`);
  glow.addColorStop(1, `rgba(${coreColor}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Diffraction spikes on medium/large stars — the photographic "pointing at
  // bright stars" look from the reference night sky.
  if (star.size !== "small") {
    const spike = radius * (star.size === "large" ? 4.2 : 2.8) * ease;
    const spikeA = 0.35 * ease * twinkle * (state.hovered ? 1.25 : 1);
    ctx.strokeStyle = `rgba(${coreColor}, ${spikeA})`;
    ctx.lineWidth = star.size === "large" ? 1.1 : 0.7;
    ctx.beginPath();
    ctx.moveTo(x - spike, y);
    ctx.lineTo(x + spike, y);
    ctx.moveTo(x, y - spike);
    ctx.lineTo(x, y + spike);
    if (star.size === "large") {
      const d = spike * 0.55;
      ctx.moveTo(x - d, y - d);
      ctx.lineTo(x + d, y + d);
      ctx.moveTo(x - d, y + d);
      ctx.lineTo(x + d, y - d);
    }
    ctx.stroke();
  }

  if (state.glint && ease > 0.4 && !state.reply) {
    const disc = Math.max(radius * 3.2, 7);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, disc, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.92 * ease;
    ctx.drawImage(state.glint, x - disc, y - disc, disc * 2, disc * 2);
    ctx.restore();
  }

  // bright core
  ctx.fillStyle = `rgba(255, 253, 248, ${clamp01(ease * twinkle * (state.glint ? 0.35 : 1))})`;
  ctx.beginPath();
  ctx.arc(x, y, state.glint ? radius * 0.7 : radius, 0, Math.PI * 2);
  ctx.fill();

  // a thin ring on the active star, like the memory is being held open
  if (state.active) {
    ctx.strokeStyle = `rgba(${coreColor}, ${0.55 * ease})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.flare && state.flare > 0) {
    const ring = radius + 6 + (1 - state.flare) * 28;
    ctx.strokeStyle = `rgba(${coreColor}, ${0.65 * state.flare})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, ring, 0, Math.PI * 2);
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

/** Multiply a colour's existing alpha. Presence 1 leaves it unchanged. */
function scaleAlpha(color: string, factor: number): string {
  const rgba = toRgba(color);
  if (!rgba) return color;
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${clamp01(rgba[3] * factor)})`;
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

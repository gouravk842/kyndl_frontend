/**
 * Procedural facet textures.
 *
 * A pane with no uploaded photo still needs *something* on the glass while the
 * gift is being authored. Rather than ship placeholder image assets, we paint a
 * soft gradient plate from the pane's glow colour with its caption etched in —
 * enough to see the lantern turn and wake. Real photos replace these in the
 * builder (Phase 4), where `glowColor` is sampled from the actual image.
 *
 * Runs only in the browser (the canvas mounts client-only via `ssr: false`), so
 * `document` is always available here.
 */

import { CanvasTexture, SRGBColorSpace } from "three";

/** Darken (t<0) or lighten (t>0) a #rrggbb by a fraction of its channel range. */
function shade(hex: string, t: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = parseInt(m?.[1] ?? "888888", 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(t < 0 ? c * (1 + t) : c + (255 - c) * t),
  );
  return `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
}

export function makePaneTexture(glowColor: string, caption: string): CanvasTexture {
  const w = 512;
  const h = 680;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Base vertical wash: glow at the top fading to a deep shade at the foot.
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, shade(glowColor, 0.22));
  grad.addColorStop(0.55, glowColor);
  grad.addColorStop(1, shade(glowColor, -0.62));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // A soft radial highlight, like light catching frosted glass.
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.36, 20, w * 0.5, h * 0.36, w * 0.7);
  glow.addColorStop(0, "rgba(255,255,255,0.35)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // The caption, etched near the foot.
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = "600 42px ui-serif, Georgia, 'Times New Roman', serif";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 12;
  wrapText(ctx, caption, w / 2, h - 96, w - 80, 50);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  // Bottom-anchor the block so it stays clear of the foot.
  const startY = y - (lines.length - 1) * lineHeight;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

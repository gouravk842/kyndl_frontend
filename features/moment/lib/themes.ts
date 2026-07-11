import type { MomentTheme } from "../types";

/**
 * Per-theme visual tokens for the Moment Engine. Two worlds the recipient can
 * open into — a midnight starfield or a warm blush dawn. Kept as plain class
 * strings (not CSS vars) so each phase composes them with `cn` directly.
 */
export type MomentThemeTokens = {
  /** Full-screen background gradient. */
  background: string;
  /** Primary text colour for big lines. */
  text: string;
  /** Muted/secondary text. */
  muted: string;
  /** Accent used for the "yes" button + glows. */
  accentBg: string;
  accentText: string;
  /** Ring/border accent for the seal + cards. */
  accentBorder: string;
  /** Floating ambient particle colour (rgb for inline style). */
  particle: string;
  /** Font for the headline voice. */
  headlineFont: string;
};

export const MOMENT_THEMES: Record<MomentTheme, MomentThemeTokens> = {
  midnight: {
    background:
      "bg-[radial-gradient(ellipse_90%_70%_at_50%_15%,#2a2350_0%,#171331_45%,#0a0820_100%)]",
    text: "text-amber-50",
    muted: "text-indigo-200/70",
    accentBg: "bg-amber-300 hover:bg-amber-200",
    accentText: "text-indigo-950",
    accentBorder: "border-amber-200/40",
    particle: "255, 236, 179",
    headlineFont: "font-cursive",
  },
  blush: {
    background:
      "bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,#fff6f0_0%,#ffe1e6_50%,#f7c5cf_100%)]",
    text: "text-rose-950",
    muted: "text-rose-900/60",
    accentBg: "bg-rose-500 hover:bg-rose-400",
    accentText: "text-white",
    accentBorder: "border-rose-400/50",
    particle: "244, 114, 142",
    headlineFont: "font-cursive",
  },
};

export function themeTokens(theme: MomentTheme): MomentThemeTokens {
  return MOMENT_THEMES[theme] ?? MOMENT_THEMES.midnight;
}

/**
 * Timeless Treasure — content & art-direction config.
 *
 * A digital keepsake box the recipient opens once. Tap the closed box and the
 * lid lifts, light spills out, and a strip of film rises from inside. Pulling
 * (scrolling) the strip unspools it frame by frame — each photo *develops*
 * (blur/sepia → sharp/colour) as it enters view. Tucked in beside the reel are a
 * folded `letter` that unfolds and an engraved `tag` (the keepsake plate).
 *
 * Everything personal lives here. Edit it in your own voice before sending;
 * nothing else in the feature needs to change.
 */

/** A reference to one of the user's uploaded files, resolved to a URL on read. */
export type MediaRef = { fileId: string };

/** One frame on the film strip — an id for stable keys, its media ref, and the
 *  little caption/date printed under the photo. */
export type ReelFrame = {
  id: string;
  fileId: string;
  /** A short line printed under the frame, e.g. "The first trip". */
  caption: string;
  /** An optional date stamp, e.g. "Aug 2023". */
  date: string;
};

/** The folded note that unfolds inside the box. */
export type Letter = {
  /** The line at the top of the page, e.g. "For you". */
  heading: string;
  /** The message itself. */
  body: string;
};

/** The engraved keepsake plate on the box. */
export type Tag = {
  /** The big engraved line, e.g. "Made of Happy Memories". */
  title: string;
  /** A small line under it, e.g. "Our first year · 2024". */
  occasion: string;
};

/** Palette keys — mirrored in the backend's `THEMES` choice set. */
export type TreasureThemeKey = "brass" | "rose" | "midnight" | "emerald";

export type TimelessTreasureConfig = {
  /** Whose treasure this is — shown on the closed box and the tag. */
  recipientName: string;
  /** Who it's from — engraved on the tag. */
  senderName: string;
  theme: TreasureThemeKey;
  /** The engraved keepsake plate. */
  tag: Tag;
  /** The photos on the film strip, in unspool order. */
  frames: ReelFrame[];
  /** The folded note tucked in the box. */
  letter: Letter;
  /** An optional track that loops while the box is open. */
  music?: MediaRef;
};

/** Visual art-direction for a treasure — one entry per {@link TreasureThemeKey}. */
export type TreasureTheme = {
  key: TreasureThemeKey;
  name: string;
  /** Full-bleed page background (the soft surface the box rests on). */
  background: string;
  /** The box body (the walls of the box). */
  boxBody: string;
  /** The box lid. */
  boxLid: string;
  /** The dark interior seen once the lid lifts. */
  boxInner: string;
  /** The metal — clasp, sprocket holes, plate rim, light accents. */
  metal: string;
  /** The bloom of light that spills out when the lid opens. */
  glow: string;
  /** The film strip base (the dark celluloid) — used on the box's inner leader. */
  film: string;
  /** The heavy cardstock the accordion panels are cut from. */
  paper: string;
  /** The shadowed edge/crease tint where the cardstock folds. */
  paperEdge: string;
  /** The engraved plate face. */
  plate: string;
  /** Ink engraved into the plate. */
  plateInk: string;
  /** Ink used on light surfaces off the box (captions, letter). */
  ink: string;
  /** Primary accent. */
  accent: string;
  /** Whether the theme reads as dark (switches some page text to light). */
  dark: boolean;
};

export const THEMES: Record<TreasureThemeKey, TreasureTheme> = {
  brass: {
    key: "brass",
    name: "Antique Brass",
    background:
      "radial-gradient(ellipse 95% 75% at 50% 8%, #fbf3e6 0%, #f0e0c8 48%, #e2c9a6 100%)",
    boxBody: "linear-gradient(150deg, #b6864f 0%, #8f622f 100%)",
    boxLid: "linear-gradient(150deg, #c9975c 0%, #a06e37 100%)",
    boxInner:
      "radial-gradient(ellipse at 50% 30%, #3a2a15 0%, #241708 70%, #180f04 100%)",
    metal: "#e8c583",
    glow: "radial-gradient(circle, rgba(255,238,196,0.95) 0%, rgba(255,206,120,0.42) 45%, transparent 72%)",
    film: "#141110",
    paper: "#f6ecd6",
    paperEdge: "rgba(90,63,28,0.16)",
    plate: "linear-gradient(160deg, #f3dfae 0%, #d8b878 100%)",
    plateInk: "#5a3f1c",
    ink: "#4a3620",
    accent: "#c07a2c",
    dark: false,
  },
  rose: {
    key: "rose",
    name: "Rose Gold",
    background:
      "radial-gradient(ellipse 95% 75% at 50% 8%, #fdeef0 0%, #f6d9dd 48%, #edb8bf 100%)",
    boxBody: "linear-gradient(150deg, #c98a7f 0%, #a85f57 100%)",
    boxLid: "linear-gradient(150deg, #dda093 0%, #bb7269 100%)",
    boxInner:
      "radial-gradient(ellipse at 50% 30%, #3a1e20 0%, #261214 70%, #190b0d 100%)",
    metal: "#f0c3ae",
    glow: "radial-gradient(circle, rgba(255,228,224,0.95) 0%, rgba(255,190,180,0.42) 45%, transparent 72%)",
    film: "#181112",
    paper: "#fbeae4",
    paperEdge: "rgba(122,63,54,0.16)",
    plate: "linear-gradient(160deg, #f7dccf 0%, #e6b39f 100%)",
    plateInk: "#7a3f36",
    ink: "#5a3630",
    accent: "#c76c5e",
    dark: false,
  },
  midnight: {
    key: "midnight",
    name: "Midnight Silver",
    background:
      "radial-gradient(ellipse 95% 75% at 50% 8%, #eef1f8 0%, #d9e0ef 48%, #c0cbe4 100%)",
    boxBody: "linear-gradient(150deg, #2b3550 0%, #161d33 100%)",
    boxLid: "linear-gradient(150deg, #3a486a 0%, #212a45 100%)",
    boxInner:
      "radial-gradient(ellipse at 50% 30%, #141a2e 0%, #0b0f1d 70%, #060811 100%)",
    metal: "#c7d2e8",
    glow: "radial-gradient(circle, rgba(224,235,255,0.95) 0%, rgba(150,185,255,0.42) 45%, transparent 72%)",
    film: "#0f1320",
    paper: "#eef2fa",
    paperEdge: "rgba(43,53,82,0.16)",
    plate: "linear-gradient(160deg, #e4ebf7 0%, #b9c6df 100%)",
    plateInk: "#2b3552",
    ink: "#2b3552",
    accent: "#5a86d6",
    dark: false,
  },
  emerald: {
    key: "emerald",
    name: "Emerald & Gold",
    background:
      "radial-gradient(ellipse 95% 75% at 50% 8%, #f0f6ec 0%, #dcecd6 48%, #bfd8b6 100%)",
    boxBody: "linear-gradient(150deg, #23503a 0%, #123021 100%)",
    boxLid: "linear-gradient(150deg, #2f6349 0%, #1a412d 100%)",
    boxInner:
      "radial-gradient(ellipse at 50% 30%, #10261b 0%, #08160e 70%, #040d08 100%)",
    metal: "#e0c483",
    glow: "radial-gradient(circle, rgba(255,240,200,0.95) 0%, rgba(210,220,150,0.42) 45%, transparent 72%)",
    film: "#0c1610",
    paper: "#f2ecd7",
    paperEdge: "rgba(51,80,47,0.16)",
    plate: "linear-gradient(160deg, #f0e0ad 0%, #d3b877 100%)",
    plateInk: "#33502f",
    ink: "#2c4028",
    accent: "#4f9a6a",
    dark: false,
  },
};

export const THEME_ORDER: TreasureThemeKey[] = [
  "brass",
  "rose",
  "midnight",
  "emerald",
];

export function themeFor(key: string): TreasureTheme {
  return THEMES[key as TreasureThemeKey] ?? THEMES.brass;
}

export const TIMELESS_TREASURE_CONFIG: TimelessTreasureConfig = {
  // ↓ Make it theirs.
  recipientName: "Aanya",

  senderName: "Kabir",

  theme: "brass",

  tag: {
    title: "Made of Happy Memories",
    occasion: "Our first year · 2024",
  },

  // The demo ships with no photos — the reel shows gentle placeholder frames
  // until you add your own, so the marketing page still reads.
  frames: [],

  letter: {
    heading: "For you",
    body: "I couldn't fit a whole year into a box, so I made you this instead. Every frame in here is a day I got to keep because of you. Wind it back whenever you want to remember how good it's been — I'll be right here, making more of them with you.",
  },
};

/**
 * String Frame — content & art-direction config.
 *
 * A chalkboard-style board carrying a big, hand-drawn `name` in vibrant letters,
 * with the recipient's `photos` pinned across a string on little clothespins —
 * all shown at once (a static display, not a slideshow). Beside the board is a
 * wrapped gift box the recipient taps to open, revealing the private `hidden`
 * message, while the uploaded `music` loops.
 *
 * Everything personal lives here. Edit it in your own voice before sending;
 * nothing else in the feature needs to change.
 */

/** A reference to one of the user's uploaded files, resolved to a URL on read. */
export type MediaRef = { fileId: string };

/** One pinned photo — an id for stable keys plus its media ref. */
export type FramePhoto = { id: string; fileId: string };

/** The private note the gift box opens to reveal. */
export type HiddenMessage = {
  /** The line at the top of the card, e.g. "Happy Birthday". */
  heading: string;
  /** The message itself. */
  body: string;
};

/** Palette keys — mirrored in the backend's `THEMES` choice set. */
export type FrameThemeKey = "chalkboard" | "kraft" | "navy" | "forest";

export type StringFrameConfig = {
  /** The big hand-drawn name across the board, e.g. "Rodrick". */
  name: string;
  /** A small line under the string, e.g. an occasion or date. */
  caption: string;
  theme: FrameThemeKey;
  /** The emblem struck on the gift box's wax seal, e.g. "3" or "❤". */
  giftLabel: string;
  /** The photos pinned across the string, in order. */
  photos: FramePhoto[];
  /** The looping track played behind the board. */
  music?: MediaRef;
  /** The private message the gift box reveals when opened. */
  hidden: HiddenMessage;
};

/** Visual art-direction for a board — one entry per {@link FrameThemeKey}. */
export type FrameTheme = {
  key: FrameThemeKey;
  name: string;
  /** Full-bleed page background (the satin/table surface). */
  background: string;
  /** The board surface. */
  board: string;
  /** A hairline frame around the board. */
  boardBorder: string;
  /** Chalk colour for the doodles + caption written on the board. */
  chalk: string;
  /** The rotating palette the big name's letters cycle through. */
  namePalette: string[];
  /** The twine the photos hang from. */
  twine: string;
  /** The wooden clothespins. */
  clip: string;
  /** Primary accent. */
  accent: string;
  /** Ink used on light surfaces off the board (page caption). */
  ink: string;
  /** The wrapped gift box body. */
  giftBox: string;
  /** The gift box lid. */
  giftLid: string;
  /** The ribbon and bow. */
  ribbon: string;
  /** Ink on the wax-seal medallion. */
  seal: string;
  /** Whether the theme reads as dark (switches some page text to light). */
  dark: boolean;
};

const VIVID = ["#ff5d73", "#ffb43b", "#ffe14d", "#4bd0a0", "#4aa8ff", "#b478ff"];

export const THEMES: Record<FrameThemeKey, FrameTheme> = {
  chalkboard: {
    key: "chalkboard",
    name: "Chalkboard",
    background:
      "radial-gradient(ellipse 90% 70% at 50% 0%, #fbf4ea 0%, #f1e4d2 45%, #e6d1ba 100%)",
    board: "linear-gradient(145deg, #1c1c1e 0%, #0d0d0f 100%)",
    boardBorder: "rgba(255,255,255,0.08)",
    chalk: "rgba(255,255,255,0.82)",
    namePalette: VIVID,
    twine: "rgba(255,255,255,0.55)",
    clip: "#d9a86a",
    accent: "#ff5d73",
    ink: "#3a2a25",
    giftBox: "#0d0d10",
    giftLid: "#17171c",
    ribbon: "#050506",
    seal: "#caa14a",
    dark: false,
  },
  kraft: {
    key: "kraft",
    name: "Kraft",
    background:
      "radial-gradient(ellipse 90% 70% at 50% 0%, #fbf6ee 0%, #f0e6d5 45%, #e2d0b8 100%)",
    board: "linear-gradient(145deg, #b98c5a 0%, #a2764a 100%)",
    boardBorder: "rgba(0,0,0,0.15)",
    chalk: "rgba(255,251,242,0.9)",
    namePalette: ["#ffffff", "#ffe14d", "#ff8f5d", "#7fe0c0", "#8fc7ff", "#ffb0d0"],
    twine: "rgba(70,45,20,0.6)",
    clip: "#5e3f22",
    accent: "#c85b39",
    ink: "#4a3524",
    giftBox: "#4a3320",
    giftLid: "#5a3f28",
    ribbon: "#2f2012",
    seal: "#f0dcb4",
    dark: false,
  },
  navy: {
    key: "navy",
    name: "Midnight",
    background:
      "radial-gradient(ellipse 90% 70% at 50% 0%, #eef2f8 0%, #dbe3f0 45%, #c3cfe4 100%)",
    board: "linear-gradient(145deg, #1b2745 0%, #0d1425 100%)",
    boardBorder: "rgba(255,255,255,0.1)",
    chalk: "rgba(226,235,255,0.85)",
    namePalette: VIVID,
    twine: "rgba(226,235,255,0.5)",
    clip: "#c9a06a",
    accent: "#5aa8ff",
    ink: "#2b3552",
    giftBox: "#0d1425",
    giftLid: "#18223b",
    ribbon: "#060a14",
    seal: "#caa14a",
    dark: false,
  },
  forest: {
    key: "forest",
    name: "Forest",
    background:
      "radial-gradient(ellipse 90% 70% at 50% 0%, #f2f6ec 0%, #e2ecd8 45%, #cddcbe 100%)",
    board: "linear-gradient(145deg, #21331f 0%, #101c0f 100%)",
    boardBorder: "rgba(255,255,255,0.09)",
    chalk: "rgba(240,247,232,0.85)",
    namePalette: ["#ffe14d", "#ff8f5d", "#ff6d8e", "#7fe0a0", "#9fd0ff", "#d9b0ff"],
    twine: "rgba(240,247,232,0.5)",
    clip: "#c9a06a",
    accent: "#5cc98a",
    ink: "#2c4028",
    giftBox: "#101c0f",
    giftLid: "#1b2b18",
    ribbon: "#060d05",
    seal: "#d8c68a",
    dark: false,
  },
};

export const THEME_ORDER: FrameThemeKey[] = [
  "chalkboard",
  "kraft",
  "navy",
  "forest",
];

export function themeFor(key: string): FrameTheme {
  return THEMES[key as FrameThemeKey] ?? THEMES.chalkboard;
}

export const STRING_FRAME_CONFIG: StringFrameConfig = {
  // ↓ Make it theirs.
  name: "Rodrick",

  caption: "",

  theme: "chalkboard",

  giftLabel: "3",

  // The demo ships with no photos — the string shows gentle placeholders until
  // you clip your own on, so the marketing page still reads.
  photos: [],

  hidden: {
    heading: "Happy Birthday",
    body: "Three whole gifts and this is the last one — because no wrapping could ever hold what I actually wanted to say. You make every ordinary day feel like the good kind of unforgettable. Here's to you. I'm so lucky it's you.",
  },
};

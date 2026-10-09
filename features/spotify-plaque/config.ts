/**
 * Spotify Plaque — content & art-direction config.
 *
 * Classic acrylic keepsake: square cover art, a personal message with a liked
 * heart, track title/artist, Spotify-style transport, and a monochrome scan
 * code — with a sealed glass whisper note beside it for the private message.
 */

/** A reference to one of the user's uploaded files, resolved to a URL on read. */
export type MediaRef = { fileId: string };

/** One cover slide — an id for stable keys plus its media ref. */
export type PlaquePhoto = { id: string; fileId: string };

/** The private note the glass whisper opens to reveal. */
export type HiddenMessage = {
  /** The line at the top of the letter, e.g. "Happy Anniversary". */
  heading: string;
  /** The message itself. */
  body: string;
};

/** Palette keys — mirrored in the backend's `THEMES` choice set. */
export type PlaqueThemeKey = "ivory" | "blush" | "noir" | "sage";

export type PlaqueConfig = {
  /** Personal line under the cover, e.g. "Happy birthday". */
  title: string;
  /** Optional secondary line (kept for older drafts; not shown on the plaque). */
  caption: string;
  /** A short free-form date/occasion stamp, e.g. "14 Feb. 2024". */
  date: string;
  theme: PlaqueThemeKey;
  /** The track name under the message. */
  songLabel: string;
  /** Artist line under the song title. */
  artist: string;
  /** Cover frames — cross-fade when more than one. */
  photos: PlaquePhoto[];
  /** The looping track played by the transport. */
  music?: MediaRef;
  /** The private message the glass note reveals when opened. */
  hidden: HiddenMessage;
};

/** The Spotify wordmark green — available when a green glyph is wanted. */
export const SPOTIFY_GREEN = "#1db954";

/** Visual art-direction for a plaque — one entry per {@link PlaqueThemeKey}. */
export type PlaqueTheme = {
  key: PlaqueThemeKey;
  name: string;
  /** Full-bleed atmosphere behind the acrylic. */
  background: string;
  /** Acrylic slab fill. */
  glassTint: string;
  /** Acrylic hairline border. */
  glassBorder: string;
  /** Empty cover well tint. */
  well: string;
  /** Primary text / icons on the plaque. */
  ink: string;
  /** Soft secondary text. */
  inkSoft: string;
  /** Bars + glyph of the scan strip (monochrome like a physical plaque). */
  scanBar: string;
  /** Accent glow / ribbon / focus. */
  accent: string;
  /** Glass note body. */
  noteGlass: string;
  /** Glass note border. */
  noteBorder: string;
  /** Ribbon / seal thread. */
  ribbon: string;
  /** Ribbon deep shade. */
  ribbonDeep: string;
  /** Whether the theme reads as dark (switches some page text to light). */
  dark: boolean;
};

export const THEMES: Record<PlaqueThemeKey, PlaqueTheme> = {
  ivory: {
    key: "ivory",
    name: "Ivory",
    background:
      "radial-gradient(110% 80% at 18% 8%, #fffaf3 0%, transparent 55%), radial-gradient(90% 70% at 88% 88%, #d4cbc0 0%, transparent 48%), linear-gradient(165deg, #f3ebe0 0%, #cfc6bb 42%, #8a837a 100%)",
    glassTint: "rgba(255,255,255,0.92)",
    glassBorder: "rgba(255,255,255,0.95)",
    well: "rgba(0,0,0,0.04)",
    ink: "#121212",
    inkSoft: "rgba(18,18,18,0.55)",
    scanBar: "#121212",
    accent: "#c4a06a",
    noteGlass: "rgba(255,252,246,0.28)",
    noteBorder: "rgba(255,255,255,0.55)",
    ribbon: "#c9a46e",
    ribbonDeep: "#8f6d3f",
    dark: false,
  },
  blush: {
    key: "blush",
    name: "Blush",
    background:
      "radial-gradient(110% 80% at 16% 6%, #fff2f5 0%, transparent 55%), radial-gradient(90% 70% at 90% 86%, #e0c0c8 0%, transparent 48%), linear-gradient(165deg, #f8e8ec 0%, #d8b8c0 42%, #6a4a52 100%)",
    glassTint: "rgba(255,248,250,0.94)",
    glassBorder: "rgba(255,255,255,0.95)",
    well: "rgba(74,36,52,0.05)",
    ink: "#1a1014",
    inkSoft: "rgba(26,16,20,0.55)",
    scanBar: "#1a1014",
    accent: "#c2557a",
    noteGlass: "rgba(255,246,248,0.3)",
    noteBorder: "rgba(255,255,255,0.58)",
    ribbon: "#d4889e",
    ribbonDeep: "#9a4f68",
    dark: false,
  },
  noir: {
    key: "noir",
    name: "Noir",
    background:
      "radial-gradient(100% 80% at 15% 0%, #3a3a44 0%, transparent 50%), radial-gradient(80% 60% at 90% 100%, #1a1a22 0%, transparent 45%), linear-gradient(165deg, #2a2a32 0%, #121218 55%, #07070a 100%)",
    glassTint: "rgba(18,18,18,0.94)",
    glassBorder: "rgba(255,255,255,0.14)",
    well: "rgba(255,255,255,0.06)",
    ink: "#f5f5f5",
    inkSoft: "rgba(245,245,245,0.55)",
    scanBar: "#f5f5f5",
    accent: "#caa14a",
    noteGlass: "rgba(255,255,255,0.08)",
    noteBorder: "rgba(255,255,255,0.22)",
    ribbon: "#d4b06a",
    ribbonDeep: "#9a7a3e",
    dark: true,
  },
  sage: {
    key: "sage",
    name: "Sage",
    background:
      "radial-gradient(110% 80% at 16% 6%, #f4f7ef 0%, transparent 55%), radial-gradient(90% 70% at 90% 86%, #c2cbb8 0%, transparent 48%), linear-gradient(165deg, #e6ecde 0%, #b6c0ae 42%, #4a5248 100%)",
    glassTint: "rgba(250,252,246,0.94)",
    glassBorder: "rgba(255,255,255,0.92)",
    well: "rgba(44,52,36,0.05)",
    ink: "#141814",
    inkSoft: "rgba(20,24,20,0.55)",
    scanBar: "#141814",
    accent: "#5f8f68",
    noteGlass: "rgba(244,247,238,0.28)",
    noteBorder: "rgba(255,255,255,0.55)",
    ribbon: "#7fa887",
    ribbonDeep: "#4f7356",
    dark: false,
  },
};

export const THEME_ORDER: PlaqueThemeKey[] = ["ivory", "blush", "noir", "sage"];

export function themeFor(key: string): PlaqueTheme {
  return THEMES[key as PlaqueThemeKey] ?? THEMES.ivory;
}

export const PLAQUE_CONFIG: PlaqueConfig = {
  title: "Happy birthday",
  caption: "",
  date: "",
  theme: "ivory",
  songLabel: "Tum Se Hi",
  artist: "Mohit Chauhan",
  photos: [],
  hidden: {
    heading: "Happy Anniversary",
    body: "Seven years, and somehow every song still sounds like you. This one's ours — press play, look at us, and remember that I'd choose this, and you, every single time. I love you.",
  },
};

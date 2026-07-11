/**
 * Spotify Plaque — content & art-direction config.
 *
 * A framed keepsake, staged like a product shot: a wax-sealed envelope beside a
 * frosted-glass plaque. Inside the plaque, a vintage card carries a script
 * `title`, `date`, a slideshow of `photos`, a `caption`, and a "now playing"
 * scan strip for the looping `music`. Tapping the envelope unwraps the private
 * `hidden` message.
 *
 * Everything personal lives here. Edit it in your own voice before sending;
 * nothing else in the feature needs to change.
 */

/** A reference to one of the user's uploaded files, resolved to a URL on read. */
export type MediaRef = { fileId: string };

/** One slide in the frame — an id for stable keys plus its media ref. */
export type PlaquePhoto = { id: string; fileId: string };

/** The private note the envelope opens to reveal. */
export type HiddenMessage = {
  /** The line at the top of the letter, e.g. "Happy Anniversary". */
  heading: string;
  /** The message itself. */
  body: string;
};

/** Palette keys — mirrored in the backend's `THEMES` choice set. */
export type PlaqueThemeKey = "ivory" | "blush" | "noir" | "sage";

export type PlaqueConfig = {
  /** The script line across the top of the card, e.g. "Solamente tú". */
  title: string;
  /** The small line beneath the photo, e.g. "Te amo". */
  caption: string;
  /** A short free-form date/occasion stamp, e.g. "14 Feb. 2024". */
  date: string;
  theme: PlaqueThemeKey;
  /** The track name shown by the scan strip (labelling the uploaded song). */
  songLabel: string;
  /** Optional artist line under the song title. */
  artist: string;
  /** The slideshow photos, shown in order and cross-faded. */
  photos: PlaquePhoto[];
  /** The looping track played behind the plaque. */
  music?: MediaRef;
  /** The private message the envelope reveals when opened. */
  hidden: HiddenMessage;
};

/** The Spotify wordmark green — kept fixed across themes so the scan strip
 *  always reads as Spotify, whatever the paper. */
export const SPOTIFY_GREEN = "#1db954";

/** Visual art-direction for a plaque — one entry per {@link PlaqueThemeKey}. */
export type PlaqueTheme = {
  key: PlaqueThemeKey;
  name: string;
  /** Full-bleed studio backdrop (warm glow → cool wall). */
  background: string;
  /** Frosted-glass plaque panel tint. */
  glassTint: string;
  /** Frosted-glass hairline border. */
  glassBorder: string;
  /** The aged paper of the inner card. */
  paper: string;
  /** Script + caption ink on the card. */
  ink: string;
  /** A soft secondary ink for the date/labels. */
  inkSoft: string;
  /** Bars of the scan strip (the Spotify glyph itself stays green). */
  scanBar: string;
  /** Accent used off the card (reveal icon, glow). */
  accent: string;
  /** The envelope body. */
  envelope: string;
  /** The envelope flap (a touch lighter than the body). */
  envelopeFlap: string;
  /** The wax seal's bright gold. */
  seal: string;
  /** The wax seal's deep gold (rim + embossed mark). */
  sealDeep: string;
  /** Whether the theme reads as dark (switches some page text to light). */
  dark: boolean;
};

export const THEMES: Record<PlaqueThemeKey, PlaqueTheme> = {
  ivory: {
    key: "ivory",
    name: "Ivory",
    background:
      "linear-gradient(103deg, #f4ece0 0%, #ece4d6 38%, #b9bcc1 70%, #3f434b 100%)",
    glassTint: "rgba(246,241,232,0.16)",
    glassBorder: "rgba(255,255,255,0.55)",
    paper:
      "linear-gradient(160deg, #f5e9d0 0%, #ecdcb9 52%, #ddc79a 100%)",
    ink: "#4a3a24",
    inkSoft: "#8a7350",
    scanBar: "#3c3122",
    accent: "#b98d4e",
    envelope: "#2e333f",
    envelopeFlap: "#353b48",
    seal: "#e0c07f",
    sealDeep: "#a97e46",
    dark: false,
  },
  blush: {
    key: "blush",
    name: "Blush",
    background:
      "linear-gradient(103deg, #fbeef1 0%, #f6e2e8 38%, #d3bcc4 70%, #4a3a44 100%)",
    glassTint: "rgba(255,246,248,0.18)",
    glassBorder: "rgba(255,255,255,0.6)",
    paper: "linear-gradient(160deg, #fbecec 0%, #f5dcdf 52%, #ecc7cf 100%)",
    ink: "#6e2a44",
    inkSoft: "#b07d90",
    scanBar: "#5a2438",
    accent: "#c2557a",
    envelope: "#3a2b33",
    envelopeFlap: "#45333c",
    seal: "#e6c98f",
    sealDeep: "#b0864f",
    dark: false,
  },
  noir: {
    key: "noir",
    name: "Noir",
    background:
      "linear-gradient(103deg, #4a4a52 0%, #2c2c33 42%, #1a1a1f 74%, #0c0c10 100%)",
    glassTint: "rgba(255,255,255,0.08)",
    glassBorder: "rgba(255,255,255,0.28)",
    paper: "linear-gradient(160deg, #f3ecdd 0%, #e7dcc4 52%, #d6c6a4 100%)",
    ink: "#3a3222",
    inkSoft: "#8a7c5e",
    scanBar: "#2f2818",
    accent: "#caa14a",
    envelope: "#0e0e12",
    envelopeFlap: "#17171d",
    seal: "#e2c079",
    sealDeep: "#a97e46",
    dark: true,
  },
  sage: {
    key: "sage",
    name: "Sage",
    background:
      "linear-gradient(103deg, #eef2e8 0%, #e2e9d8 38%, #bcc4b6 70%, #3a4038 100%)",
    glassTint: "rgba(244,247,238,0.16)",
    glassBorder: "rgba(255,255,255,0.55)",
    paper: "linear-gradient(160deg, #f2eed9 0%, #e6e1c2 52%, #d3cfa0 100%)",
    ink: "#3a442a",
    inkSoft: "#7d8768",
    scanBar: "#2e3620",
    accent: "#5f8f68",
    envelope: "#28322a",
    envelopeFlap: "#313c33",
    seal: "#dccb92",
    sealDeep: "#a58e52",
    dark: false,
  },
};

export const THEME_ORDER: PlaqueThemeKey[] = ["ivory", "blush", "noir", "sage"];

export function themeFor(key: string): PlaqueTheme {
  return THEMES[key as PlaqueThemeKey] ?? THEMES.ivory;
}

export const PLAQUE_CONFIG: PlaqueConfig = {
  // ↓ Make it theirs.
  title: "Solamente tú",

  caption: "Te amo",

  date: "14 Feb. 2024",

  theme: "ivory",

  songLabel: "Our song",

  artist: "",

  // The demo ships with no photos — the frame shows a gentle placeholder until
  // you add your own, so the marketing page still reads.
  photos: [],

  hidden: {
    heading: "Happy Anniversary",
    body: "Seven years, and somehow every song still sounds like you. This one's ours — press play, look at us, and remember that I'd choose this, and you, every single time. I love you.",
  },
};

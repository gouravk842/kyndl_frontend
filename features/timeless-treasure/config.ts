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
export type TreasureThemeKey =
  | "sand"
  | "sage"
  | "rose"
  | "denim"
  | "plum"
  | "brass"
  | "emerald"
  | "midnight";

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
  /** The metal — plate rim, the stud on the pull-strap, light accents. */
  metal: string;
  /** The heavy cardstock the cards + prints are cut from. */
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
  sand: {
    key: "sand",
    name: "Warm Sand",
    metal: "#e7cfa4",
    paper: "#f8f1e5",
    paperEdge: "rgba(120,92,50,0.15)",
    plate: "linear-gradient(160deg, #f0e2c6 0%, #dcc59a 100%)",
    plateInk: "#6b512c",
    ink: "#574632",
    accent: "#c1935a",
    dark: false,
  },
  sage: {
    key: "sage",
    name: "Soft Sage",
    metal: "#d8d2a8",
    paper: "#f4f2e6",
    paperEdge: "rgba(70,86,60,0.15)",
    plate: "linear-gradient(160deg, #eef0d8 0%, #d4dab0 100%)",
    plateInk: "#46543a",
    ink: "#3f4a38",
    accent: "#7a9668",
    dark: false,
  },
  rose: {
    key: "rose",
    name: "Blush Rose",
    metal: "#f0cabb",
    paper: "#fbf0ee",
    paperEdge: "rgba(140,80,80,0.14)",
    plate: "linear-gradient(160deg, #f8ddd4 0%, #ecc0b4 100%)",
    plateInk: "#7d4b45",
    ink: "#6a4a48",
    accent: "#cf8a86",
    dark: false,
  },
  denim: {
    key: "denim",
    name: "Dusty Denim",
    metal: "#cdd8ea",
    paper: "#eef1f6",
    paperEdge: "rgba(60,80,110,0.14)",
    plate: "linear-gradient(160deg, #e2e9f4 0%, #c4d1e6 100%)",
    plateInk: "#3f5170",
    ink: "#3a4a60",
    accent: "#6f8fbf",
    dark: false,
  },
  plum: {
    key: "plum",
    name: "Mauve Plum",
    metal: "#ddc6dd",
    paper: "#f5eef4",
    paperEdge: "rgba(90,60,90,0.14)",
    plate: "linear-gradient(160deg, #ecdcea 0%, #d3b8d0 100%)",
    plateInk: "#5c4159",
    ink: "#533f52",
    accent: "#a67aa4",
    dark: false,
  },
  brass: {
    key: "brass",
    name: "Cognac",
    metal: "#ecca88",
    paper: "#f7efdd",
    paperEdge: "rgba(120,80,40,0.15)",
    plate: "linear-gradient(160deg, #f2ddab 0%, #dcbb78 100%)",
    plateInk: "#6a4a24",
    ink: "#55402a",
    accent: "#c98a45",
    dark: false,
  },
  emerald: {
    key: "emerald",
    name: "Forest Green",
    metal: "#e0c483",
    paper: "#eef2e6",
    paperEdge: "rgba(40,70,45,0.15)",
    plate: "linear-gradient(160deg, #eee2b0 0%, #d2be7c 100%)",
    plateInk: "#33502f",
    ink: "#2f4a34",
    accent: "#4f9a6a",
    dark: false,
  },
  midnight: {
    key: "midnight",
    name: "Ink Navy",
    metal: "#c9d4ec",
    paper: "#eef1f8",
    paperEdge: "rgba(40,50,80,0.15)",
    plate: "linear-gradient(160deg, #e6ecf8 0%, #c6d2ea 100%)",
    plateInk: "#2f3a58",
    ink: "#303a56",
    accent: "#6a86d0",
    dark: false,
  },
};

export const THEME_ORDER: TreasureThemeKey[] = [
  "sand",
  "sage",
  "rose",
  "denim",
  "plum",
  "brass",
  "emerald",
  "midnight",
];

export function themeFor(key: string): TreasureTheme {
  return THEMES[key as TreasureThemeKey] ?? THEMES.brass;
}

/**
 * Extra art-direction the *album* presentation needs on top of a {@link
 * TreasureTheme}: the leather cover, the linen surface it rests on, the
 * stitching thread and the gold foil the dedication is embossed in. Kept out of
 * the backend-validated `TreasureTheme` (which only gates the `theme` key) so
 * the wire contract is untouched — this is pure frontend presentation.
 */
export type SceneTokens = {
  /** The fabric surface the open album lies on (the tablecloth). */
  linen: string;
  /** Faint woven texture tint layered over the linen. */
  linenWeave: string;
  /** The leather of the album cover / pocket. */
  leather: string;
  /** A darker leather used for the pull-strap and shadowed edges. */
  leatherDark: string;
  /** The waxed highlight that catches the light along a leather crease. */
  leatherSheen: string;
  /** The saddle-stitch thread running the inner border. */
  stitch: string;
  /** The gold/foil the script + nameplate are embossed in. */
  foil: string;
  /** Shadow cast into the open pocket mouth. */
  pocketShadow: string;
};

const SCENE: Record<TreasureThemeKey, SceneTokens> = {
  sand: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #faf3e8 0%, #efe2cd 46%, #ddcaad 100%)",
    linenWeave: "rgba(120,92,50,0.045)",
    leather: "linear-gradient(155deg, #cdaa7b 0%, #b28d5c 52%, #977542 100%)",
    leatherDark: "linear-gradient(155deg, #b28d5c 0%, #8a6939 100%)",
    leatherSheen: "rgba(248,232,200,0.55)",
    stitch: "#f5ead0",
    foil: "#f2ddac",
    pocketShadow: "rgba(74,52,24,0.5)",
  },
  sage: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #f0f3e8 0%, #dfe6d2 46%, #c8d5ba 100%)",
    linenWeave: "rgba(70,90,60,0.045)",
    leather: "linear-gradient(155deg, #90a37d 0%, #74895f 52%, #5b7047 100%)",
    leatherDark: "linear-gradient(155deg, #74895f 0%, #556842 100%)",
    leatherSheen: "rgba(226,236,198,0.5)",
    stitch: "#eef0d2",
    foil: "#e9debf",
    pocketShadow: "rgba(38,50,28,0.5)",
  },
  rose: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #fbeeee 0%, #f2d9d9 46%, #e6bec1 100%)",
    linenWeave: "rgba(130,70,70,0.045)",
    leather: "linear-gradient(155deg, #d3a19b 0%, #ba7d75 52%, #a06058 100%)",
    leatherDark: "linear-gradient(155deg, #ba7d75 0%, #92544c 100%)",
    leatherSheen: "rgba(250,220,208,0.55)",
    stitch: "#f9e0d3",
    foil: "#f3d1bd",
    pocketShadow: "rgba(60,30,28,0.5)",
  },
  denim: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #eef2f8 0%, #dae3ef 46%, #c0cfe4 100%)",
    linenWeave: "rgba(60,80,110,0.045)",
    leather: "linear-gradient(155deg, #8398b8 0%, #647c9f 52%, #4c5f80 100%)",
    leatherDark: "linear-gradient(155deg, #647c9f 0%, #46566f 100%)",
    leatherSheen: "rgba(214,228,246,0.5)",
    stitch: "#e9eff8",
    foil: "#dde6f3",
    pocketShadow: "rgba(28,40,60,0.52)",
  },
  plum: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #f5eef4 0%, #e8d9e6 46%, #d4bdd2 100%)",
    linenWeave: "rgba(90,60,90,0.045)",
    leather: "linear-gradient(155deg, #a283a0 0%, #836482 52%, #674c66 100%)",
    leatherDark: "linear-gradient(155deg, #836482 0%, #5c435b 100%)",
    leatherSheen: "rgba(238,220,238,0.5)",
    stitch: "#f1dfee",
    foil: "#ecd6e8",
    pocketShadow: "rgba(44,28,44,0.52)",
  },
  brass: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #f9f1e0 0%, #eedcc1 46%, #dfc59f 100%)",
    linenWeave: "rgba(120,86,42,0.05)",
    leather: "linear-gradient(155deg, #b47f49 0%, #935f31 52%, #714722 100%)",
    leatherDark: "linear-gradient(155deg, #935f31 0%, #653f1c 100%)",
    leatherSheen: "rgba(240,204,150,0.5)",
    stitch: "#f2d7a6",
    foil: "#f0d094",
    pocketShadow: "rgba(48,28,12,0.54)",
  },
  emerald: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #eef4e8 0%, #d9e7cf 46%, #bdd3ad 100%)",
    linenWeave: "rgba(40,70,45,0.05)",
    leather: "linear-gradient(155deg, #3c6d4f 0%, #26543a 52%, #163d27 100%)",
    leatherDark: "linear-gradient(155deg, #26543a 0%, #143020 100%)",
    leatherSheen: "rgba(212,226,164,0.42)",
    stitch: "#ece0b2",
    foil: "#e8d5a4",
    pocketShadow: "rgba(8,24,14,0.55)",
  },
  midnight: {
    linen:
      "radial-gradient(ellipse 120% 90% at 50% -10%, #eff2fa 0%, #dde4f2 46%, #c4cfe8 100%)",
    linenWeave: "rgba(40,50,80,0.05)",
    leather: "linear-gradient(155deg, #3c4a73 0%, #283252 52%, #1a2338 100%)",
    leatherDark: "linear-gradient(155deg, #283252 0%, #161d33 100%)",
    leatherSheen: "rgba(184,204,244,0.42)",
    stitch: "#ccd6ee",
    foil: "#d4def3",
    pocketShadow: "rgba(8,12,24,0.58)",
  },
};

export function sceneFor(key: string): SceneTokens {
  return SCENE[key as TreasureThemeKey] ?? SCENE.brass;
}

/**
 * Gentle placeholder frames so the closed→open flow, the concertina unfold and
 * the marketing page all read before any real photos are added. Captions echo
 * the "a year of us" story the demo tells; the reel swaps to the sender's own
 * frames the moment they upload.
 */
export const PLACEHOLDER_FRAMES: ReelFrame[] = [
  { id: "ph-0", fileId: "", caption: "Where it began", date: "Jan" },
  { id: "ph-1", fileId: "", caption: "The first trip", date: "Apr" },
  { id: "ph-2", fileId: "", caption: "Us, unposed", date: "Jul" },
  { id: "ph-3", fileId: "", caption: "The little things", date: "Oct" },
  { id: "ph-4", fileId: "", caption: "Still here", date: "Dec" },
];

export const TIMELESS_TREASURE_CONFIG: TimelessTreasureConfig = {
  // ↓ Make it theirs.
  recipientName: "Aanya",

  senderName: "Kabir",

  theme: "sand",

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

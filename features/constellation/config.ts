/**
 * Constellation — content & art-direction config.
 *
 * Everything personal lives here. Rewrite the stars in your own voice before
 * gifting; nothing else in the feature needs to change. Six to twelve stars
 * feels right — under five reads as sparse, over fifteen gets crowded.
 *
 * Positions and `customEdges` come from `lib/layout.ts`. Individual stars sit
 * on a story path. Constellation mode gathers dated memories into one figure
 * per week, month, or year. The builder reflows on add, remove, or a date
 * change; authors can still drag a star.
 */

export type SkyOrganization = "stars" | "constellations";

/** How constellation mode buckets memories. Undated memories gather on their own. */
export type GroupGrain = "week" | "month" | "year";

export type StarSize = "small" | "medium" | "large";

/**
 * How a star opens. An opaque reference to a registered *unlock module* (see
 * `@/features/unlocks`) plus its config — a question to answer, a jigsaw to
 * solve, a time-lock to wait out. The config is validated against the module's
 * own schema when the sky loads (`lib/gates.ts`); a star with no `unlock` opens
 * straight away, as every star did before gates existed.
 */
export type StarGate = {
  /** Registered module type, e.g. "question" | "image-puzzle" | "time-lock". */
  type: string;
  /** Module-specific config, validated by that module's schema on load. */
  config?: unknown;
};

export type Star = {
  id: number;
  /** Position as a percentage of the viewport. x: 0=left, 100=right; y: 0=top, 100=bottom. Keep to x 10–90, y 10–85. */
  x: number;
  y: number;
  /** Visual tier. `large` = an anchor star. */
  size: StarSize;
  /** Shown under the star on hover, and as the memory card's title. */
  label: string;
  /** A short free-text caption (surfaced as "Caption"), e.g. "that first spring". */
  date: string;
  /** The actual calendar date of the memory, ISO `YYYY-MM-DD`. Shown formatted. */
  timestamp?: string;
  /** The full memory she reads when the star opens. Be specific — line breaks are preserved. */
  memory: string;
  /** Optional photo for this memory, e.g. "/constellation/rooftop.jpg" under /public. */
  imageUrl: string | null;
  /** An uploaded photo, as a media reference resolved to a URL for display. */
  image?: { fileId: string } | null;
  /** Who wrote this memory — stamped from the author's account, shown on the card. */
  author?: string;
  /** Optional name for this stretch of the path ("the trip"). Shown as you pass it. */
  stretch?: string;
  /** When true, a gated star re-asks its challenge every visit (vs. unlock once). */
  alwaysAsk?: boolean;
  /**
   * Optional gate this star hides behind. Absent/null = opens immediately.
   * A jigsaw gate with no `imageUrl` of its own falls back to this star's photo.
   */
  unlock?: StarGate | null;
  /**
   * Ids of other stars that must be unlocked first — the "sequential trail".
   * A star with unmet requirements stays dim and untappable until they clear.
   */
  requires?: number[];
  /**
   * A line someone left in the sky. Overlay only — never saved on the creation.
   * Faint, and it does not have to be read for the finale to light.
   */
  reply?: boolean;
};

/**
 * The shape that ignites over the constellation once every star is read — the
 * secret it was spelling all along. `"initials"` draws `finaleInitials`; the
 * named glyphs are built in; or pass your own SVG path string for a custom one.
 */
export type FinaleGlyph = "heart" | "infinity" | "initials" | (string & {});

export type FinaleConfig = {
  /** Which shape lights up at the end. Set `null` for no glyph, just lit lines. */
  glyph: FinaleGlyph | null;
  /** Used when `glyph` is `"initials"`, e.g. "A+J". One or two letters reads best. */
  initials?: string;
  /** Colour of the ignited shape and its glow. */
  color: string;
};

export type TourConfig = {
  /** Show the "play" control that flies star-to-star, telling the story. */
  enabled: boolean;
  /** How long the camera lingers on each star (memory open + read beat), in ms. */
  perStarMs: number;
};

export type SoundConfig = {
  /** Master switch for the ambient pad + per-star chimes. */
  enabled: boolean;
  /** Start muted (recommended — sound resumes on the first tap). */
  startMuted: boolean;
  /** Optional "our song" — a short loop, ducked under the chimes. */
  song?: { fileId: string } | null;
};

export type WishConfig = {
  /** A hidden line revealed if she catches a shooting star. */
  message: string;
};

/**
 * The night meadow beneath the stars: a high-contrast silhouette with cool
 * horizon haze, ridges, a tree, a couple lying on their backs pointing up, and
 * wind-blown grass. Set `enabled: false` for a plain deep-void sky.
 */
export type GroundKind = "meadow" | "rooftop" | "shore";

export type SceneConfig = {
  enabled: boolean;
  /** The ground under the stars. The meadow is the default. */
  ground?: GroundKind;
  /** Where the horizon/ground sits, as a % of viewport height from the top. */
  groundLevel: number;
  /** Height of the foreground grass band, as a % of viewport height. */
  grassBand: number;
  /** Soft starlight tones on the horizon (cool silver, not sunset). */
  horizonGlow: string;
  horizonHaze: string;
  /** Tint of the low clouds. */
  cloudTint: string;
  /** Near-black silhouette colour for ground and figures. */
  silhouette: string;
  /** Glow colour of sparse dew-points in the grass. */
  flowerColor: string;
  /** How quickly the wind cycles — lower is slower/calmer. */
  windSpeed: number;
};

export type SkyConfig = {
  /**
   * Stable id for this sky — namespaces the "already seen the first-view
   * ceremony" flag in localStorage. Change it to replay the ceremony.
   */
  id: string;
  /** Who the sky is for — shown on the entrance gate ("For …"). */
  recipientName: string;
  /** The name of your constellation — whispered above the stars. */
  constellationName: string;
  /** One line shown on load, low at the bottom of the sky. */
  subtitle: string;
  stars: Star[];
  /** How the lines read. */
  lineStyle: "solid" | "dashed" | "dotted";
  lineColor: string;
  skyColors: { top: string; middle: string; bottom: string };
  /** Core colour of the soft cloud behind the constellation. */
  nebulaColor: string;
  /** Tiny twinkling stars filling the sky. Keep ≤ 350 for mobile frame rate. */
  backgroundStarCount: number;
  /** ms between shooting stars after the entrance. 0 disables them. */
  shootingStarFrequency: number;
  /** Shown at the bottom once every star has been opened. */
  allStarsOpenedMessage: string;
  /**
   * When true (default), the lines stay as faint "ghosts" until both stars they
   * join have been opened — so the constellation draws itself as she reads, and
   * the shape is the reward. Set false for the old behaviour: all lines drawn up
   * front during the entrance.
   */
  revealEdgesOnOpen: boolean;
  /** Draw faint preview lines before they're earned, hinting the shape to come. */
  ghostEdges: boolean;
  /** The secret shape that ignites at the finale. */
  finale: FinaleConfig;
  /** The cinematic guided tour. */
  tour: TourConfig;
  /** Ambient soundscape. */
  sound: SoundConfig;
  /** The dusk-meadow scene beneath the stars. */
  scene: SceneConfig;
  /** Optional bonus message hidden in a catchable shooting star. */
  wish?: WishConfig;
  /**
   * Optional explicit connections by star id. When set, these replace the
   * default sequential 1→2→3 path — use them to draw an actual shape. Each pair
   * is [fromId, toId].
   */
  customEdges?: [number, number][];
  /**
   * `stars` keeps one memory per point on a path. `constellations` gathers
   * each week, month, or year into its own figure. Absent on older skies,
   * which stay a path of individual stars.
   */
  organization?: SkyOrganization;
  /** Time bucket used when `organization` is `constellations`. */
  groupBy?: GroupGrain;
};

/** Copy a brand-new star still carries. Publish refuses a sky that only has this. */
export const PLACEHOLDER_STAR_LABEL = "a new memory";
export const PLACEHOLDER_STAR_MEMORY = "Write the moment this star holds…";

export const SKY_CONFIG: SkyConfig = {
  // ↓ Make it hers.
  id: "the-two-of-us",
  recipientName: "you",
  constellationName: "The two of us",
  subtitle: "tap a star to open a memory",

  // Positions + edges come from the Celestial Bloom layout (Vogel spiral +
  // branching asterism) — same algorithm the builder runs when memories are added.
  stars: [
    {
      id: 1,
      x: 61.3,
      y: 30,
      size: "large",
      label: "the beginning",
      date: "the night we met",
      memory:
        "You were laughing at something before I'd even said anything funny, and I remember thinking I'd spend a long time trying to be the reason you laughed like that again.\n\nI didn't know your name yet. I already didn't want the night to end.",
      imageUrl: null,
    },
    {
      id: 2,
      x: 37.7,
      y: 37.2,
      size: "medium",
      label: "the long drive",
      date: "that first spring",
      memory:
        "No destination, the windows down, the same four songs on repeat because neither of us wanted to change it. You fell asleep against the window near the end and I drove slower so it would last.",
      imageUrl: null,
    },
    {
      id: 3,
      x: 52.3,
      y: 13.8,
      size: "large",
      label: "somewhere far",
      date: "our first trip",
      memory:
        "Cold mornings, terrible coffee, a map we never really followed. We got lost twice and called it exploring both times. It's still the most at-home I've ever felt being nowhere in particular.",
      imageUrl: null,
    },
    {
      id: 4,
      x: 65.1,
      y: 42.8,
      size: "small",
      label: "the hard week",
      date: "later that year",
      memory:
        "We were both wrong and both too tired to say it. But you reached for my hand in the dark before either of us had apologised, and that told me everything I needed to know about us.\n\nA constellation with only the easy nights would be a lie. This one stays.",
      imageUrl: null,
    },
    {
      id: 5,
      x: 20.5,
      y: 26.7,
      size: "medium",
      label: "your day",
      date: "your birthday",
      memory:
        "You kept saying you didn't want a fuss, then smiled the whole way through the fuss. I'd ruin a hundred surprises just to watch you try not to cry over a cake again.",
      imageUrl: null,
    },
    {
      id: 6,
      x: 80.7,
      y: 17.8,
      size: "large",
      label: "when I knew",
      date: "an ordinary Tuesday",
      memory:
        "Not a big moment. You were doing something dull at the kitchen counter, humming, and it landed quietly: this is it. This is the person. The rest of it has just been me being grateful, on a loop.",
      imageUrl: null,
    },
    {
      id: 7,
      x: 40.6,
      y: 52.4,
      size: "medium",
      label: "still going",
      date: "and now",
      memory:
        "We're still here, still writing it. Every day adds a star I haven't drawn yet. Keep looking up — I'm not done filling this sky.",
      imageUrl: null,
    },
  ],

  lineStyle: "solid",
  lineColor: "rgba(235, 240, 255, 0.28)",

  // Deep charcoal void — photographic night, not a painted blue dusk.
  skyColors: {
    top: "#020308",
    middle: "#05070e",
    bottom: "#0a0c14",
  },
  nebulaColor: "#12151f",

  backgroundStarCount: 320,
  shootingStarFrequency: 7500,

  allStarsOpenedMessage:
    "You've read every star in our sky. There are more being written every day. I love you.",

  organization: "stars",
  groupBy: "month",

  // Story spine + local branches for the sample sky.
  customEdges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [1, 4],
    [2, 7],
    [1, 3],
  ],

  revealEdgesOnOpen: true,
  ghostEdges: true,

  finale: {
    glyph: "heart",
    color: "rgba(255, 220, 230, 0.88)",
  },

  tour: {
    enabled: true,
    perStarMs: 6000,
  },

  sound: {
    enabled: true,
    startMuted: true,
  },

  scene: {
    enabled: true,
    ground: "meadow",
    // Lying on your back: the ground is only the bottom edge of the frame.
    groundLevel: 91,
    grassBand: 9,
    horizonGlow: "#8a92a8",
    horizonHaze: "#3a4050",
    cloudTint: "#6a7288",
    silhouette: "#010204",
    flowerColor: "rgba(210, 220, 240, 0.5)",
    windSpeed: 0.4,
  },

  wish: {
    message:
      "You caught one. Make the wish — I've already got mine, and it's been you the whole time.",
  },
};

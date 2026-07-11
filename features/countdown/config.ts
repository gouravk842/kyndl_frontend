/**
 * Countdown — content & art-direction config.
 *
 * A shared countdown to a moment you're both waiting for. The clock runs to
 * `targetDate`; while it counts, the recipient can open the little `notes` left
 * to keep them company; when it reaches zero the `reveal` opens — the surprise.
 *
 * Everything personal lives here. Edit it in your own voice before sending;
 * nothing else in the feature needs to change.
 */

/** A reference to one of the user's uploaded files, resolved to a URL on read. */
export type MediaRef = { fileId: string };

/** Palette keys — mirrored in the backend's `THEMES` choice set. */
export type CountdownThemeKey = "sunset" | "dusk" | "rose" | "ocean";

/** A short note the recipient can open while the clock is still running. */
export type CountdownNote = {
  id: number;
  /** A few words on the face of the card. */
  label: string;
  /** The message read when the card is opened. */
  message: string;
};

/** The surprise that waits at zero. */
export type CountdownReveal = {
  /** The big line that lands the moment the clock hits zero. */
  headline: string;
  /** The surprise itself, read under the headline. */
  message: string;
  /** An optional photo unveiled with the reveal. */
  image?: MediaRef;
};

export type CountdownConfig = {
  recipientName: string;
  /** The headline above the clock. */
  title: string;
  /** A small caption above the title, e.g. "counting down to". */
  occasion: string;
  /** ISO-8601 instant the countdown runs to. */
  targetDate: string;
  theme: CountdownThemeKey;
  /** Shown beneath the clock while it's still counting. */
  anticipationMessage: string;
  reveal: CountdownReveal;
  /** Optional looping music played when the reveal opens. */
  music?: MediaRef;
  /** Optional little notes to open while waiting. */
  notes: CountdownNote[];
};

/** Visual art-direction for a countdown — one entry per {@link CountdownThemeKey}. */
export type CountdownTheme = {
  key: CountdownThemeKey;
  name: string;
  /** Full-bleed page background. */
  background: string;
  /** A soft radial glow blooming behind the clock. */
  glow: string;
  /** Primary accent (eyebrow, ring, reveal headline). */
  accent: string;
  /** The big ticking digits. */
  digit: string;
  /** Unit labels under each digit + body copy. */
  label: string;
  /** The face of each digit card. */
  card: string;
  /** Border of each digit card. */
  cardBorder: string;
  /** Confetti colours rained at the reveal. */
  confetti: string[];
  /** Whether the theme reads as dark (switches some text to light). */
  dark: boolean;
};

export const THEMES: Record<CountdownThemeKey, CountdownTheme> = {
  sunset: {
    key: "sunset",
    name: "Sunset",
    background:
      "radial-gradient(ellipse 80% 60% at 50% 0%, #ffd9c2 0%, #ffb39a 38%, #f47e74 72%, #d65a64 100%)",
    glow: "radial-gradient(circle, rgba(255,214,170,0.85) 0%, rgba(255,150,120,0.35) 45%, transparent 70%)",
    accent: "#b8324a",
    digit: "#fff6ef",
    label: "#fbe4d6",
    card: "rgba(255,255,255,0.14)",
    cardBorder: "rgba(255,255,255,0.35)",
    confetti: ["#ffffff", "#ffd9b3", "#ff9a7b", "#f2596f", "#ffe08a"],
    dark: true,
  },
  dusk: {
    key: "dusk",
    name: "Dusk",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 5%, #3b3170 0%, #271f54 42%, #171238 74%, #0c0922 100%)",
    glow: "radial-gradient(circle, rgba(168,150,255,0.6) 0%, rgba(120,100,230,0.28) 45%, transparent 70%)",
    accent: "#c9b6ff",
    digit: "#f4f0ff",
    label: "#ccc3f0",
    card: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(180,165,255,0.35)",
    confetti: ["#ffffff", "#c9b6ff", "#8f7bff", "#ffd86b", "#7be0ff"],
    dark: true,
  },
  rose: {
    key: "rose",
    name: "Rose",
    background:
      "radial-gradient(ellipse 80% 60% at 50% 0%, #fff1f4 0%, #ffd9e2 40%, #ffb9cd 72%, #f58fb0 100%)",
    glow: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,190,210,0.4) 45%, transparent 70%)",
    accent: "#c43b6e",
    digit: "#7a2246",
    label: "#a85274",
    card: "rgba(255,255,255,0.55)",
    cardBorder: "rgba(196,59,110,0.22)",
    confetti: ["#ffffff", "#ffd0de", "#ff9ebd", "#f2709c", "#ffe08a"],
    dark: false,
  },
  ocean: {
    key: "ocean",
    name: "Ocean",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 0%, #cdf3ef 0%, #8fd9e0 38%, #4fb3cc 72%, #2c7fa6 100%)",
    glow: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(150,230,235,0.4) 45%, transparent 70%)",
    accent: "#0d5e78",
    digit: "#063444",
    label: "#0d5e78",
    card: "rgba(255,255,255,0.45)",
    cardBorder: "rgba(13,94,120,0.22)",
    confetti: ["#ffffff", "#bff0ec", "#5cc7d4", "#2c7fa6", "#ffe08a"],
    dark: false,
  },
};

export const THEME_ORDER: CountdownThemeKey[] = [
  "sunset",
  "dusk",
  "rose",
  "ocean",
];

export function themeFor(key: string): CountdownTheme {
  return THEMES[key as CountdownThemeKey] ?? THEMES.sunset;
}

export const COUNTDOWN_CONFIG: CountdownConfig = {
  // ↓ Make it theirs.
  recipientName: "my love",

  title: "Until we're together again",

  occasion: "counting down to",

  // A far-future instant so the sample clock keeps ticking on the demo page.
  targetDate: "2027-02-14T19:00:00",

  theme: "sunset",

  anticipationMessage:
    "Not long now. Every second on this clock is one second closer to you — and I'm counting every single one.",

  reveal: {
    headline: "It's finally here.",
    message:
      "The wait is over. Whatever we were counting down to, we made it — together, the way we always do. Here's to the moment, and to every one after it. I love you.",
  },

  notes: [
    {
      id: 1,
      label: "for the slow days",
      message:
        "If the waiting feels long today, come back here and remember: the best things are the ones worth counting down to. I'd wait so much longer for you.",
    },
    {
      id: 2,
      label: "halfway there",
      message:
        "We're closer than we've ever been. Keep going — I'm right here on the other side of this clock, thinking about you the whole time.",
    },
    {
      id: 3,
      label: "almost",
      message:
        "Nearly there now. Save your best smile for zero — I have a feeling you're going to need it.",
    },
  ],
};

/**
 * Time Capsule — content & art-direction config.
 *
 * Seal a message today; it stays locked until `unlockDate`, then opens on its
 * own. While sealed, the recipient sees the capsule, who it's from, a teaser,
 * and a live countdown. When the moment arrives the capsule cracks open to the
 * `letter` (and any `photos`).
 *
 * Everything personal lives here; the shape mirrors the backend's
 * `TimeCapsuleContentSerializer`.
 */

/** A reference to one of the user's uploaded files, resolved to a URL on read. */
export type MediaRef = { fileId: string };

/** Palette keys — mirrored in the backend's `THEMES` choice set. */
export type TimeCapsuleThemeKey =
  | "vault"
  | "parchment"
  | "midnight"
  | "rosegold";

/** The sealed letter revealed when the capsule opens. */
export type TimeCapsuleLetter = {
  /** Opening line, e.g. "Dear future us,". */
  greeting: string;
  /** The body of the message. */
  body: string;
  /** Closing line / signature, e.g. "Always, me". */
  signoff: string;
};

export type TimeCapsuleConfig = {
  /** Card title + the line on the sealed capsule. */
  title: string;
  recipientName: string;
  senderName: string;
  /** ISO-8601 instant the capsule unlocks. */
  unlockDate: string;
  theme: TimeCapsuleThemeKey;
  /** A teaser shown while the capsule is still sealed. */
  teaser: string;
  letter: TimeCapsuleLetter;
  /** Optional photos unveiled with the letter when it opens. */
  photos: MediaRef[];
  /** Optional looping music played once the capsule opens. */
  music?: MediaRef;
};

/** Visual art-direction for a capsule — one entry per {@link TimeCapsuleThemeKey}. */
export type TimeCapsuleTheme = {
  key: TimeCapsuleThemeKey;
  name: string;
  /** Full-bleed page background. */
  background: string;
  /** Soft radial glow behind the capsule. */
  glow: string;
  /** Primary accent (eyebrow, seal, headings). */
  accent: string;
  /** The capsule body gradient (its metal/material face). */
  shell: string;
  /** The capsule's rim / seam colour. */
  rim: string;
  /** Heading + body ink on the letter card. */
  ink: string;
  /** The letter card face. */
  paper: string;
  /** Whether the theme reads as dark (switches some page text to light). */
  dark: boolean;
};

export const THEMES: Record<TimeCapsuleThemeKey, TimeCapsuleTheme> = {
  vault: {
    key: "vault",
    name: "Vault",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 5%, #2c3550 0%, #1d2438 45%, #12172a 76%, #0a0e1c 100%)",
    glow: "radial-gradient(circle, rgba(150,190,255,0.5) 0%, rgba(90,120,210,0.25) 45%, transparent 70%)",
    accent: "#9db9ff",
    shell:
      "linear-gradient(145deg, #d9e2f2 0%, #aab6cf 40%, #7f8db0 70%, #5c6789 100%)",
    rim: "#3a4560",
    ink: "#1b2138",
    paper: "#f6f4ee",
    dark: true,
  },
  parchment: {
    key: "parchment",
    name: "Parchment",
    background:
      "radial-gradient(ellipse 80% 60% at 50% 0%, #fbf1dc 0%, #f2dfba 42%, #e6c894 74%, #d3ac6c 100%)",
    glow: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(230,200,148,0.4) 45%, transparent 70%)",
    accent: "#9a6a2f",
    shell:
      "linear-gradient(145deg, #f7e6c6 0%, #e6c894 45%, #cfa869 72%, #b78a45 100%)",
    rim: "#8a6329",
    ink: "#4a3410",
    paper: "#fffaf0",
    dark: false,
  },
  midnight: {
    key: "midnight",
    name: "Midnight",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 5%, #3b2f66 0%, #271f4e 44%, #171236 76%, #0b0820 100%)",
    glow: "radial-gradient(circle, rgba(180,150,255,0.55) 0%, rgba(130,100,230,0.28) 45%, transparent 70%)",
    accent: "#c9b6ff",
    shell:
      "linear-gradient(145deg, #e7defb 0%, #c0abec 42%, #9a80d6 72%, #765bb8 100%)",
    rim: "#5a3f96",
    ink: "#2a1f52",
    paper: "#f7f3ff",
    dark: true,
  },
  rosegold: {
    key: "rosegold",
    name: "Rose gold",
    background:
      "radial-gradient(ellipse 80% 60% at 50% 0%, #fff1f0 0%, #ffd9d4 42%, #f6b7ac 74%, #e58f86 100%)",
    glow: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(246,183,172,0.4) 45%, transparent 70%)",
    accent: "#c25e63",
    shell:
      "linear-gradient(145deg, #ffe6df 0%, #f6c0b3 45%, #e29a8c 72%, #c8776a 100%)",
    rim: "#a85a52",
    ink: "#6a2e30",
    paper: "#fff7f4",
    dark: false,
  },
};

export const THEME_ORDER: TimeCapsuleThemeKey[] = [
  "vault",
  "parchment",
  "midnight",
  "rosegold",
];

export function themeFor(key: string): TimeCapsuleTheme {
  return THEMES[key as TimeCapsuleThemeKey] ?? THEMES.vault;
}

export const TIME_CAPSULE_CONFIG: TimeCapsuleConfig = {
  // ↓ Make it theirs.
  title: "Open when it's time",

  recipientName: "my love",

  senderName: "me",

  // A far-future instant so the sample capsule stays sealed on the demo page.
  unlockDate: "2027-02-14T09:00:00",

  theme: "vault",

  teaser:
    "I wrote you something and locked it away for this exact day. No peeking early — I promise it's worth the wait.",

  letter: {
    greeting: "Dear you,",
    body: "If you're reading this, the day we were waiting for is finally here. I wanted to send a little piece of who I am right now forward through time to meet you — to remind you how loved you are, and how sure I've always been about us. Whatever the world looks like today, I hope this finds you smiling.",
    signoff: "Always yours, and always on time,",
  },

  photos: [],
};

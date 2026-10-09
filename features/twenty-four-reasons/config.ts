/**
 * 24 Reasons — timed keepsake (not Red Zone, not a responding Moment).
 *
 * Up to 24 reasons unlock across a day. Each reason stores its own `unlockAt`
 * (source of truth). Builder may derive those from `anchorAt` + `intervalHours`.
 */

import { reasonsFromMessages } from "./lib/schedule";

export type Occasion = "none" | "girlfriend-day";

export type MediaRef = { fileId: string };

export type Reason = {
  id: string;
  /** Display index 1–24. */
  n: number;
  label: string;
  message: string;
  image?: MediaRef | null;
  audio?: MediaRef | null;
  /** ISO-8601 instant — source of truth for lock state. */
  unlockAt: string;
  teaser: string;
};

export type TwentyFourReasonsContent = {
  recipientName: string;
  ownerName: string;
  title: string;
  intro: string;
  occasion: Occasion;
  anchorAt: string;
  intervalHours: number;
  timezoneLabel: string;
  reasons: Reason[];
};

export const DEFAULT_TITLE = "24 Reasons";

export const DEFAULT_INTRO =
  "One reason for every hour of your day. Sealed until their time.";

/** Girlfriend Day default anchor (IST midnight Aug 1 2026) — builder overrides. */
export const DEFAULT_ANCHOR_AT = "2026-08-01T00:00:00+05:30";

/**
 * Local midnight on Aug 1 for the given year (device timezone).
 * Used when enabling Girlfriend Day packaging in the builder.
 */
export function girlfriendDayAnchorAt(
  year: number = new Date().getFullYear(),
): string {
  return new Date(year, 7, 1, 0, 0, 0, 0).toISOString();
}

export const INTERVAL_PRESETS = [0.5, 1, 2, 3, 4, 6, 8, 12, 24] as const;

export function blankContent(): TwentyFourReasonsContent {
  return {
    recipientName: "",
    ownerName: "",
    title: DEFAULT_TITLE,
    intro: DEFAULT_INTRO,
    occasion: "none",
    anchorAt: DEFAULT_ANCHOR_AT,
    intervalHours: 1,
    timezoneLabel: "",
    reasons: [],
  };
}

/** Starter pack lines (Girlfriend Day / Us) — times applied via schedule helper. */
export const STARTER_MESSAGES: string[] = [
  "You make ordinary mornings feel like a beginning",
  "I love how you laugh at your own jokes",
  "Home is whichever room you’re in",
  "You notice the things I forget to say",
  "We’re a team — even in the silly fights",
  "Your voice on a bad day still steadies me",
  "I’d choose this story again",
  "You make me braver than I feel",
  "The little routines with you are my favorites",
  "Proud doesn’t cover it — I’m lucky",
  "You remember the details that matter",
  "Soft nights. Loud love. That’s us.",
  "Thank you for staying when it’s hard",
  "Your weird and my weird fit",
  "Future-me already knows: it’s you",
  "You turn errands into something I look forward to",
  "I fall for you in quiet ways, all day",
  "Safe is a person — it’s you",
  "Still my favorite notification",
  "You make generosity look easy",
  "I’d rewrite the dull days just to keep you in them",
  "Loving you is the least complicated true thing I know",
  "Today is for you — loudly",
  "Reason 24: always you. Happy Girlfriend Day.",
];

export const DEMO_CONTENT: TwentyFourReasonsContent = {
  recipientName: "you",
  ownerName: "me",
  title: DEFAULT_TITLE,
  intro: DEFAULT_INTRO,
  occasion: "girlfriend-day",
  anchorAt: DEFAULT_ANCHOR_AT,
  intervalHours: 1,
  timezoneLabel: "IST",
  // Filled by schedule.applySchedule in consumers; keep empty here to avoid
  // circular init — parity fixture builds its own short set.
  reasons: [],
};

/**
 * Marketing / live-page demo: starter pack with an anchor ~5 hours before the
 * current hour so several reasons are already open and the next unlock ticks.
 */
export function getDemoContent(
  now: number = Date.now(),
): TwentyFourReasonsContent {
  const hourMs = 60 * 60 * 1000;
  const roundedHour = Math.floor(now / hourMs) * hourMs;
  const anchorAt = new Date(roundedHour - 5 * hourMs).toISOString();

  const base: TwentyFourReasonsContent = {
    recipientName: "you",
    ownerName: "me",
    title: DEFAULT_TITLE,
    intro: DEFAULT_INTRO,
    occasion: "girlfriend-day",
    anchorAt,
    intervalHours: 1,
    timezoneLabel: "",
    reasons: [],
  };

  return {
    ...base,
    reasons: reasonsFromMessages(STARTER_MESSAGES, base),
  };
}

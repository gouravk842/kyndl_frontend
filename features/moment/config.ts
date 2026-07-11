import type { MomentDoc } from "./types";

/**
 * Sample documents that double as (a) the marketing/preview content and (b) the
 * builder's starter doc. One per Moment flavour — same engine, different
 * intensity and theme.
 */

export const SAMPLE_PROPOSAL: MomentDoc = {
  theme: "midnight",
  sealLabel: "For you, my love",
  approach: [
    { id: "a1", kind: "line", text: "Before you read another word…" },
    { id: "a2", kind: "line", text: "take a breath with me." },
    {
      id: "a3",
      kind: "counter",
      label: "days since the night I knew",
      sinceDate: "2022-03-14",
    },
    {
      id: "a4",
      kind: "line",
      text: "Every one of them led me here, to this question.",
    },
  ],
  question: {
    text: "Will you marry me?",
    yesLabel: "Yes",
    noLabel: "No",
    playfulNo: true,
  },
  celebration: {
    headline: "Forever starts now",
    subtext: "I can't wait to spend every day with you.",
    askerName: "Arjun",
    recipientName: "Maya",
  },
};

export const SAMPLE_DATE_ASK: MomentDoc = {
  theme: "blush",
  sealLabel: "Open me?",
  approach: [
    { id: "a1", kind: "line", text: "Okay, I've been working up the nerve…" },
    { id: "a2", kind: "line", text: "so here goes nothing." },
  ],
  question: {
    text: "Will you go out with me?",
    yesLabel: "Yes!",
    noLabel: "Hmm…",
    playfulNo: true,
  },
  celebration: {
    headline: "It's a date 🎉",
    subtext: "I'll pick you up Friday at 7.",
  },
  plan: { when: "Friday, 7:00 PM", where: "that little place by the river" },
};

/** Default document the public viewer falls back to if content is malformed. */
export const SAMPLE_MOMENTS = {
  proposal: SAMPLE_PROPOSAL,
  "date-ask": SAMPLE_DATE_ASK,
} as const;

/**
 * This or That — authored A/B pairs + end blurb.
 */

export type ThisOrThatPair = {
  id: string;
  left: string;
  right: string;
};

export type ThisOrThatConfig = {
  title: string;
  intro: string;
  pairs: ThisOrThatPair[];
  resultBlurb: string;
};

export const DEFAULT_PAIRS: ThisOrThatPair[] = [
  { id: "p1", left: "Chai", right: "Coffee" },
  { id: "p2", left: "Texts", right: "Calls" },
  { id: "p3", left: "Sunrise", right: "Midnight" },
  { id: "p4", left: "Movies", right: "Walks" },
  { id: "p5", left: "Sweet", right: "Spicy" },
  { id: "p6", left: "Plan it", right: "Wing it" },
  { id: "p7", left: "Playlist", right: "Silence" },
  { id: "p8", left: "Inside jokes", right: "Long talks" },
];

export const THIS_OR_THAT_CONFIG: ThisOrThatConfig = {
  title: "This or That",
  intro: "No overthinking. Tap fast. We'll grade your vibe.",
  pairs: DEFAULT_PAIRS,
  resultBlurb: "That's your type card. Wear it proudly.",
};

export function starterDoc(): ThisOrThatConfig {
  return {
    ...THIS_OR_THAT_CONFIG,
    pairs: THIS_OR_THAT_CONFIG.pairs.map((p) => ({ ...p })),
  };
}

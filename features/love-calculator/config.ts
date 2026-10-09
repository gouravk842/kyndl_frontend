/**
 * Love Calculator — authored setup. Score lives in `lib/score`.
 */

export type LoveBands = {
  low: string;
  mid: string;
  high: string;
};

export type LoveCalculatorConfig = {
  title: string;
  intro: string;
  nameA: string;
  nameB: string;
  note: string;
  bands: LoveBands;
};

export const LOVE_CALCULATOR_CONFIG: LoveCalculatorConfig = {
  title: "Love Calculator",
  intro: "Enter two names. Fake science. Real butterflies.",
  nameA: "",
  nameB: "",
  note: "Percentages lie. Feelings don't — text me.",
  bands: {
    low: "The vibes are… warming up. Keep showing up.",
    mid: "Solid crush energy. Don't ghost the plot.",
    high: "Dangerously destined (according to vibes).",
  },
};

export function starterDoc(): LoveCalculatorConfig {
  return {
    ...LOVE_CALCULATOR_CONFIG,
    bands: { ...LOVE_CALCULATOR_CONFIG.bands },
  };
}

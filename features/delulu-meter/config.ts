/**
 * Delulu Meter — weighted prompts + band copy.
 */

export type DeluluQuestion = {
  id: string;
  prompt: string;
  weight: number;
};

export type DeluluBands = {
  grounded: string;
  hopeful: string;
  delulu: string;
};

export type DeluluMeterConfig = {
  title: string;
  intro: string;
  questions: DeluluQuestion[];
  bands: DeluluBands;
};

export const DEFAULT_QUESTIONS: DeluluQuestion[] = [
  {
    id: "q1",
    prompt: "They liked your story from 2019. Wedding when?",
    weight: 2,
  },
  {
    id: "q2",
    prompt: "You re-read a dry “ok” like it’s poetry.",
    weight: 2,
  },
  {
    id: "q3",
    prompt: "You’ve named your future pets already.",
    weight: 3,
  },
  {
    id: "q4",
    prompt: "A mutual follow feels like a soft launch.",
    weight: 1,
  },
  {
    id: "q5",
    prompt: "You’re drafting texts in Notes, not Chat.",
    weight: 2,
  },
  {
    id: "q6",
    prompt: "Eye contact once = “they’re obsessed.”",
    weight: 3,
  },
];

export const DELULU_METER_CONFIG: DeluluMeterConfig = {
  title: "Delulu Meter",
  intro: "Answer honestly. Or don't. The gauge knows.",
  questions: DEFAULT_QUESTIONS,
  bands: {
    grounded: "Touch grass champion. Still cute though.",
    hopeful: "Romantic with a Wi-Fi connection. Respect.",
    delulu: "Main character in a fanfic they didn't ask for.",
  },
};

export function starterDoc(): DeluluMeterConfig {
  return {
    ...DELULU_METER_CONFIG,
    questions: DELULU_METER_CONFIG.questions.map((q) => ({ ...q })),
    bands: { ...DELULU_METER_CONFIG.bands },
  };
}

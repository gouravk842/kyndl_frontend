/**
 * FLAMES — authored setup. Letter-strike play lives in `lib/engine`.
 * Shape mirrors `experiences.types.flames.FlamesContentSerializer`.
 */

export type FlamesConfig = {
  title: string;
  intro: string;
  nameA: string;
  nameB: string;
  /** Shown under the result card. */
  note: string;
};

export const FLAMES_CONFIG: FlamesConfig = {
  title: "FLAMES",
  intro: "Type both names. Cancel matching letters. Destiny does the rest.",
  nameA: "",
  nameB: "",
  note: "Whatever the letters say — I still hope it's us.",
};

export function starterDoc(): FlamesConfig {
  return { ...FLAMES_CONFIG };
}

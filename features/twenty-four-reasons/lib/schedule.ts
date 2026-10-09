import type { Reason, TwentyFourReasonsContent } from "../config";

/**
 * Derive each reason's `unlockAt` from `anchorAt` + `intervalHours * index`.
 * Overwrites every reason's unlock time (and renumbers `n`).
 */
export function applySchedule(
  doc: TwentyFourReasonsContent,
): TwentyFourReasonsContent {
  const anchorMs = Date.parse(doc.anchorAt);
  if (Number.isNaN(anchorMs)) return doc;

  const stepMs = doc.intervalHours * 60 * 60 * 1000;
  const reasons = doc.reasons.map((r, i) => ({
    ...r,
    n: i + 1,
    unlockAt: new Date(anchorMs + stepMs * i).toISOString(),
  }));
  return { ...doc, reasons };
}

/** Build N text reasons from messages, then apply the doc's schedule. */
export function reasonsFromMessages(
  messages: string[],
  doc: Pick<TwentyFourReasonsContent, "anchorAt" | "intervalHours">,
): Reason[] {
  const seeded: TwentyFourReasonsContent = {
    recipientName: "",
    ownerName: "",
    title: "",
    intro: "",
    occasion: "none",
    anchorAt: doc.anchorAt,
    intervalHours: doc.intervalHours,
    timezoneLabel: "",
    reasons: messages.map((message, i) => ({
      id: `r${i + 1}`,
      n: i + 1,
      label: "",
      message,
      image: null,
      audio: null,
      unlockAt: doc.anchorAt,
      teaser: "",
    })),
  };
  return applySchedule(seeded).reasons;
}

/**
 * Pure derive of unlock timestamps for parity tests (does not touch other fields).
 * Returns ISO strings in UTC (`toISOString`) from a parseable anchor.
 */
export function deriveUnlockAts(
  anchorAt: string,
  intervalHours: number,
  count: number,
): string[] {
  const anchorMs = Date.parse(anchorAt);
  if (Number.isNaN(anchorMs)) return [];
  const stepMs = intervalHours * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, i) =>
    new Date(anchorMs + stepMs * i).toISOString(),
  );
}

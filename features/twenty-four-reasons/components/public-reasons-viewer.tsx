"use client";

import type { TwentyFourReasonsContent } from "../config";
import { ReasonsExperience } from "./reasons-experience";

/**
 * Public `/v/[token]` shell — recipient experience owns DayStage.
 */
export function PublicReasonsViewer({
  content,
  assets,
  token,
}: {
  content: TwentyFourReasonsContent;
  assets: Record<string, string>;
  token: string;
}) {
  return (
    <div className="min-h-dvh w-full">
      <ReasonsExperience content={content} assets={assets} seenScope={token} />
    </div>
  );
}

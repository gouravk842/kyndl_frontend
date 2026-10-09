"use client";

import type { MirrorContent } from "../config";
import { MirrorStage } from "./atmosphere";
import { MirrorExperience } from "./mirror-experience";

/** Public `/v/[token]` shell — stage + partner experience. */
export function PublicMirrorViewer({
  content,
  token,
}: {
  content: MirrorContent;
  token: string;
}) {
  return (
    <MirrorStage occasion={content.occasion} className="min-h-dvh w-full">
      <MirrorExperience content={content} token={token} bare />
    </MirrorStage>
  );
}

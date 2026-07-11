import { Suspense } from "react";

import { DesireDeckBuilder } from "@/features/desire-deck/components/builder/desire-deck-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Desire Deck",
  description:
    "Write your own intimate prompt cards, pick a heat for each, then save it to share privately — the customizable, adults-only deck for the two of you.",
  path: "/desire-deck/build",
});

export default function DesireDeckBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <DesireDeckBuilder />
    </Suspense>
  );
}

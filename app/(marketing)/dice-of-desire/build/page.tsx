import { Suspense } from "react";

import { DiceOfDesireBuilder } from "@/features/dice-of-desire/components/builder/dice-of-desire-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Dice of Desire",
  description:
    "Reword every square of the board, set a heat for each, then save it to share privately — the customizable, adults-only roll-a-position game for the two of you.",
  path: "/dice-of-desire/build",
});

export default function DiceOfDesireBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <DiceOfDesireBuilder />
    </Suspense>
  );
}

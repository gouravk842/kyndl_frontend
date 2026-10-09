import { Suspense } from "react";

import { TimelessTreasureBuilder } from "@/features/timeless-treasure/components/builder/timeless-treasure-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Timeless Treasure",
  description:
    "Pick the leather, write the opening note, fill the pocket with your photos and a line beside each, sign off the dedication — then save it to share.",
  path: "/timeless-treasure/build",
});

export default function TimelessTreasureBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <TimelessTreasureBuilder />
    </Suspense>
  );
}

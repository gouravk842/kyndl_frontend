import { Suspense } from "react";

import { TimelessTreasureBuilder } from "@/features/timeless-treasure/components/builder/timeless-treasure-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Timeless Treasure",
  description:
    "Pick a box finish, load the reel with your photos, engrave the keepsake tag, and tuck in a letter — then save it to share.",
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

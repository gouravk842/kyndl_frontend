import { Suspense } from "react";

import { LudoBuilder } from "@/features/ludo/components/builder/ludo-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Ludo",
  description:
    "Set your players and colours, write the couple-activity cards, and save your own Ludo board to play and share together.",
  path: "/ludo/build",
});

export default function LudoBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <LudoBuilder />
    </Suspense>
  );
}

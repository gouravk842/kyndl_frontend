import { Suspense } from "react";

import { NaughtySpinsBuilder } from "@/features/naughty-spins/components/builder/naughty-spins-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Naughty Spins",
  description:
    "Set your own categories, give each a colour and its own prompts, then save it to share privately — the customizable, adults-only spin-the-wheel for the two of you.",
  path: "/naughty-spins/build",
});

export default function NaughtySpinsBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <NaughtySpinsBuilder />
    </Suspense>
  );
}

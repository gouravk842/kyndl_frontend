import { Suspense } from "react";

import { MatcherBuilder } from "@/features/desire-matcher/components/builder/matcher-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Desire Matcher",
  description:
    "Curate intimate activities, answer each one privately, then share it. Only the things you both want are revealed — the customizable, adults-only matcher for two.",
  path: "/desire-matcher/build",
});

export default function DesireMatcherBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <MatcherBuilder />
    </Suspense>
  );
}

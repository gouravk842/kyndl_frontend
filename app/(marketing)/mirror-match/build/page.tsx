import { Suspense } from "react";

import { MirrorBuilder } from "@/features/mirror-match/components/builder/mirror-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Mirror Match",
  description:
    "Curate soft prompts about us, answer each one privately, then share. Only the overlaps are revealed — a wholesome two-sided moment for Girlfriend Day and beyond.",
  path: "/mirror-match/build",
});

export default function MirrorMatchBuildPage() {
  return (
    <Suspense fallback={null}>
      <MirrorBuilder />
    </Suspense>
  );
}

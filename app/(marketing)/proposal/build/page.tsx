import { Suspense } from "react";

import { ProposalBuilder } from "@/features/moment/components/builder/proposal-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your proposal",
  description:
    "Build a paced, cinematic proposal they live one breath at a time — then watch their yes come straight back to you.",
  path: "/proposal/build",
});

export default function ProposalBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <ProposalBuilder />
    </Suspense>
  );
}

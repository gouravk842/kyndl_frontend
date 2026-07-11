import { Suspense } from "react";

import { ConstellationBuilder } from "@/features/constellation/components/builder/constellation-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Constellation",
  description:
    "Place a star for every moment that mattered, write the memory each one holds, and save your private night sky.",
  path: "/constellation/build",
});

export default function ConstellationBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <ConstellationBuilder />
    </Suspense>
  );
}

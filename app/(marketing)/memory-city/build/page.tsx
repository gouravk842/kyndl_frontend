import { Suspense } from "react";

import { MemoryCityBuilder } from "@/features/memory-city/components/builder/memory-city-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Memory City",
  description:
    "Add a memory for every moment that mattered — a date, a mood, the words — and watch a 3D city arrange and grow itself around them.",
  path: "/memory-city/build",
});

export default function MemoryCityBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <MemoryCityBuilder />
    </Suspense>
  );
}

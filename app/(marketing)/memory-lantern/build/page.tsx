import { Suspense } from "react";

import { MemoryLanternBuilder } from "@/features/memory-lantern/components/builder/memory-lantern-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Memory Lantern",
  description:
    "Add your photos as glowing facets, caption each one, and set it turning — then save it to share a lantern that lights the room with your memories.",
  path: "/memory-lantern/build",
});

export default function MemoryLanternBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <MemoryLanternBuilder />
    </Suspense>
  );
}

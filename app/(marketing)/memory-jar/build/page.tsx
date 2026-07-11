import { Suspense } from "react";

import { MemoryJarBuilder } from "@/features/memory-jar/components/builder/memory-jar-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Memory Jar",
  description:
    "Fill a glass jar with folded notes written in your own voice, then save it to send — a warm, intimate keepsake they can open one slip at a time.",
  path: "/memory-jar/build",
});

export default function MemoryJarBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <MemoryJarBuilder />
    </Suspense>
  );
}

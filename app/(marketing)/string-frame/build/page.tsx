import { Suspense } from "react";

import { StringFrameBuilder } from "@/features/string-frame/components/builder/string-frame-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your String Frame",
  description:
    "Write the name, pin your photos across the string, add your song, and hide a message in the gift box — then save it to share.",
  path: "/string-frame/build",
});

export default function StringFrameBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <StringFrameBuilder />
    </Suspense>
  );
}

import { Suspense } from "react";

import { ReasonsBuilder } from "@/features/twenty-four-reasons/components/builder/reasons-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build 24 Reasons",
  description:
    "Write up to twenty-four reasons that unlock across their day — text, photo, and voice, sealed until their time. Perfect for Girlfriend Day and beyond.",
  path: "/twenty-four-reasons/build",
});

export default function TwentyFourReasonsBuildPage() {
  return (
    <Suspense fallback={null}>
      <ReasonsBuilder />
    </Suspense>
  );
}

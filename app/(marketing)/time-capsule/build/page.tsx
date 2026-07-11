import { Suspense } from "react";

import { TimeCapsuleBuilder } from "@/features/time-capsule/components/builder/time-capsule-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Time Capsule",
  description:
    "Write a letter, add photos, and seal it until a date that matters — it stays locked until the moment arrives, then opens on its own.",
  path: "/time-capsule/build",
});

export default function TimeCapsuleBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <TimeCapsuleBuilder />
    </Suspense>
  );
}

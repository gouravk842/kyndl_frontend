import { Suspense } from "react";

import { DateAskBuilder } from "@/features/moment/components/builder/date-ask-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your date ask",
  description:
    "A warm, playful way to ask someone out — built one beat at a time, with their yes sent right back to you.",
  path: "/date-ask/build",
});

export default function DateAskBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <DateAskBuilder />
    </Suspense>
  );
}

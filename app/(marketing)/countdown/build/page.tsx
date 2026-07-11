import { Suspense } from "react";

import { CountdownBuilder } from "@/features/countdown/components/builder/countdown-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Countdown",
  description:
    "Set the moment, choose a theme, and write the surprise that opens at zero — then save it to share and count it down together.",
  path: "/countdown/build",
});

export default function CountdownBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <CountdownBuilder />
    </Suspense>
  );
}

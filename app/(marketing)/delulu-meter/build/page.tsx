import { Suspense } from "react";

import { DeluluMeterBuilder } from "@/features/delulu-meter/components/builder/delulu-meter-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make Delulu Meter",
  description:
    "Author a comedy delulu quiz — they rate the chaos, you deliver the roast on a shareable gauge.",
  path: "/delulu-meter/build",
});

export default function DeluluMeterBuildPage() {
  return (
    <Suspense fallback={null}>
      <DeluluMeterBuilder />
    </Suspense>
  );
}

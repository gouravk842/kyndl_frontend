import { Suspense } from "react";

import { OurPlacesBuilder } from "@/features/our-places/components/builder/our-places-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Our Places",
  description:
    "Drop a glowing pin on every place that's part of you two, write the memory each one holds, and save your map.",
  path: "/our-places/build",
});

export default function OurPlacesBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <OurPlacesBuilder />
    </Suspense>
  );
}

import { Suspense } from "react";

import { ChocolateBouquetBuilder } from "@/features/chocolate-bouquet/components/builder/chocolate-bouquet-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Chocolate Bouquet",
  description:
    "Gather a bouquet where every chocolate holds a memory — pick a type for each, write the moment inside, and let them tear it open one by one.",
  path: "/chocolate-bouquet/build",
});

export default function ChocolateBouquetBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <ChocolateBouquetBuilder />
    </Suspense>
  );
}

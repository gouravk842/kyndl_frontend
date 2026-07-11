import { Suspense } from "react";

import { SnakesAndLoversBuilder } from "@/features/snakes-and-lovers/components/builder/snakes-and-lovers-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Snakes & Lovers",
  description:
    "Reword every square of the board, set a heat for each, then save it to share privately — the customizable, adults-only Snakes & Ladders for couples.",
  path: "/snakes-and-lovers/build",
});

export default function SnakesAndLoversBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <SnakesAndLoversBuilder />
    </Suspense>
  );
}

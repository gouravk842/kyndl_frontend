import { Suspense } from "react";

import { ThisOrThatBuilder } from "@/features/this-or-that/components/builder/this-or-that-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make This or That",
  description:
    "Plant rapid A/B pairs and send a This or That game that grades their vibe on a type card.",
  path: "/this-or-that/build",
});

export default function ThisOrThatBuildPage() {
  return (
    <Suspense fallback={null}>
      <ThisOrThatBuilder />
    </Suspense>
  );
}

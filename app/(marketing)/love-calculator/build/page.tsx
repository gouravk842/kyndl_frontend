import { Suspense } from "react";

import { LoveCalculatorBuilder } from "@/features/love-calculator/components/builder/love-calculator-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make Love Calculator",
  description:
    "Build a silly love-% calculator with your note and vibe blurbs — share it and watch the meter climb.",
  path: "/love-calculator/build",
});

export default function LoveCalculatorBuildPage() {
  return (
    <Suspense fallback={null}>
      <LoveCalculatorBuilder />
    </Suspense>
  );
}

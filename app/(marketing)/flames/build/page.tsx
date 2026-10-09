import { Suspense } from "react";

import { FlamesBuilder } from "@/features/flames/components/builder/flames-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make FLAMES",
  description:
    "Author a classic FLAMES name game — share the link and let destiny (and matching letters) do the rest.",
  path: "/flames/build",
});

export default function FlamesBuildPage() {
  return (
    <Suspense fallback={null}>
      <FlamesBuilder />
    </Suspense>
  );
}

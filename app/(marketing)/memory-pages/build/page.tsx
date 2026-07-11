import { Suspense } from "react";

import { BuilderExperience } from "@/features/memory-pages/components/builder/builder-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your photo album",
  description:
    "Create a personalised, page-turning photo album — add your memories one at a time and we'll arrange them into a book you can flip through.",
  path: "/memory-pages/build",
});

export default function MemoryPagesBuildPage() {
  return (
    <Suspense>
      <BuilderExperience />
    </Suspense>
  );
}

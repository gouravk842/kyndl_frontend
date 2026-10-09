import { Suspense } from "react";

import { FoldedNoteBuilder } from "@/features/folded-note/components/builder/folded-note-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make Folded Note",
  description:
    "Write a schoolyard folded note — they unfold, answer Yes / No / Maybe, and get your reaction.",
  path: "/folded-note/build",
});

export default function FoldedNoteBuildPage() {
  return (
    <Suspense fallback={null}>
      <FoldedNoteBuilder />
    </Suspense>
  );
}

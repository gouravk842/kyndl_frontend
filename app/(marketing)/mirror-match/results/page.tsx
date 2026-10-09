import { Suspense } from "react";

import { MirrorStage } from "@/features/mirror-match/components/atmosphere";
import { OwnerResults } from "@/features/mirror-match/components/results/owner-results";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Your mirror",
  description: "See where you and your partner both said yes — and almost.",
  path: "/mirror-match/results",
});

export default function MirrorMatchResultsPage() {
  return (
    <MirrorStage className="min-h-[calc(100dvh-4rem)]">
      <div className="w-full max-w-2xl">
        <Suspense fallback={null}>
          <OwnerResults />
        </Suspense>
      </div>
    </MirrorStage>
  );
}

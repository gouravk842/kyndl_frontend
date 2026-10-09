import { Suspense } from "react";

import { WhackAMoleBuilder } from "@/features/whack-a-mole/components/builder/whack-a-mole-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make Whack My Face",
  description:
    "Upload your face, write the apology, and send a couples whack-a-mole arcade your partner can smash — then forgive.",
  path: "/whack-a-mole/build",
});

export default function WhackAMoleBuildPage() {
  return (
    <Suspense fallback={null}>
      <WhackAMoleBuilder />
    </Suspense>
  );
}

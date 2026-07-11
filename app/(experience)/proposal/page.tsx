import { MomentPlayer } from "@/features/moment/components/moment-player";
import { SAMPLE_PROPOSAL } from "@/features/moment/config";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "The Big Question",
  description:
    "A paced, cinematic proposal lived one breath at a time — break the seal, walk the approach, and answer the question that changes everything.",
  path: "/proposal",
});

export default function ProposalDemoPage() {
  // The marketing demo plays the sample with no `submit` — nothing is recorded.
  return <MomentPlayer doc={SAMPLE_PROPOSAL} />;
}

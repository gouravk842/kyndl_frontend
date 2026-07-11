import { MomentPlayer } from "@/features/moment/components/moment-player";
import { SAMPLE_DATE_ASK } from "@/features/moment/config";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Will You Go Out With Me?",
  description:
    "A warm, playful way to ask someone out — break the seal, feel the build-up, and let them say yes.",
  path: "/date-ask",
});

export default function DateAskDemoPage() {
  // The marketing demo plays the sample with no `submit` — nothing is recorded.
  return <MomentPlayer doc={SAMPLE_DATE_ASK} />;
}

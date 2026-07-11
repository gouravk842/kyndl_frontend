import { TimelessTreasureExperience } from "@/features/timeless-treasure/components/timeless-treasure-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Timeless Treasure",
  description:
    "A digital keepsake box they open once — the lid lifts, a film strip rises out, and your photos develop frame by frame as they unspool the reel, down to a folded letter and an engraved keepsake tag.",
  path: "/timeless-treasure",
});

export default function TimelessTreasurePage() {
  // The experience paints its own themed, full-bleed background; we only hand it
  // the height left under the h-16 (4rem) marketing header.
  return (
    <section className="w-full">
      <TimelessTreasureExperience className="min-h-[calc(100dvh-4rem)]" />
    </section>
  );
}

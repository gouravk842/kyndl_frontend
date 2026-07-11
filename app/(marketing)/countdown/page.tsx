import { CountdownExperience } from "@/features/countdown/components/countdown-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Countdown",
  description:
    "A shared countdown to the moment you're both waiting for — watch it tick down together, and when it hits zero a surprise you wrote opens, confetti and all.",
  path: "/countdown",
});

export default function CountdownPage() {
  // The experience paints its own themed, full-bleed background; we only hand it
  // the height left under the h-16 (4rem) marketing header.
  return (
    <section className="w-full">
      <CountdownExperience className="min-h-[calc(100dvh-4rem)]" />
    </section>
  );
}

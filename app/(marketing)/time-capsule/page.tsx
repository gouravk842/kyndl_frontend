import { TimeCapsuleExperience } from "@/features/time-capsule/components/time-capsule-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Time Capsule",
  description:
    "Seal a message today and let it unlock exactly when it should — a birthday, an anniversary, a year from now. It stays locked until the moment arrives, then opens on its own.",
  path: "/time-capsule",
});

export default function TimeCapsulePage() {
  // The experience paints its own themed, full-bleed background; we only hand it
  // the height left under the h-16 (4rem) marketing header.
  return (
    <section className="w-full">
      <TimeCapsuleExperience className="min-h-[calc(100dvh-4rem)]" />
    </section>
  );
}

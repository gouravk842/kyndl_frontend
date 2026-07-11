import { OurPlacesExperience } from "@/features/our-places/components/our-places-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Our Places",
  description:
    "A love letter drawn on a map. Wander the places that are part of you two — glowing pins scattered across your story, each one opening into a memory.",
  path: "/our-places",
});

export default function OurPlacesPage() {
  // The sticky marketing header is h-16 (4rem); fill the rest of the viewport so
  // the map has a real height (a 0px-tall map renders nothing) — same as the
  // Memory Lane experience.
  return (
    <section className="h-[calc(100dvh-4rem)] w-full">
      <OurPlacesExperience />
    </section>
  );
}

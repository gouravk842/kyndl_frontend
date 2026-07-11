import { MemoryCityExperience } from "@/features/memory-city/components/memory-city-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Memory City",
  description:
    "Revolve through a dusk city where your memories live as glowing places. Stop at each one, step into a district, and recall it.",
  path: "/memory-city",
});

export default function MemoryCityPage() {
  // The sticky marketing header is h-16 (4rem); fill the rest of the viewport so
  // the canvas has a real height (a 0px-tall canvas renders nothing).
  return (
    <section className="h-[calc(100dvh-4rem)] w-full">
      <MemoryCityExperience />
    </section>
  );
}

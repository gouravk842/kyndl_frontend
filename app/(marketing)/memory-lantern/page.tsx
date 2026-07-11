import { MemoryLanternExperience } from "@/features/memory-lantern/components/memory-lantern-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Memory Lantern",
  description:
    "A softly glowing lantern that turns to light the room with each memory. Every facet is a moment; the one facing you wakes and glows its colour.",
  path: "/memory-lantern",
});

export default function MemoryLanternPage() {
  // The sticky marketing header is h-16 (4rem); fill the rest of the viewport so
  // the canvas has a real height (a 0px-tall canvas renders nothing).
  return (
    <section className="h-[calc(100dvh-4rem)] w-full">
      <MemoryLanternExperience />
    </section>
  );
}

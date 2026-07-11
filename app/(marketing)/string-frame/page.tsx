import { StringFrameExperience } from "@/features/string-frame/components/string-frame-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "String Frame",
  description:
    "A chalkboard board with a big, colourful name and your photos pinned across a string — beside a wrapped gift box that opens to a hidden message, your song playing behind it.",
  path: "/string-frame",
});

export default function StringFramePage() {
  // The experience paints its own themed, full-bleed background; we only hand it
  // the height left under the h-16 (4rem) marketing header.
  return (
    <section className="w-full">
      <StringFrameExperience className="min-h-[calc(100dvh-4rem)]" />
    </section>
  );
}

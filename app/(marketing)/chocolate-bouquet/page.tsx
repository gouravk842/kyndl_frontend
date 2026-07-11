import { ChocolateBouquetExperience } from "@/features/chocolate-bouquet/components/chocolate-bouquet-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Chocolate Bouquet",
  description:
    "A 3D bouquet where every chocolate holds a memory. Pick one, tear the foil open, and the moment tucked inside slides out — one sweet at a time.",
  path: "/chocolate-bouquet",
});

export default function ChocolateBouquetPage() {
  // The sticky marketing header is h-16 (4rem); fill the rest of the viewport so
  // the canvas has a real height (a 0px-tall canvas renders nothing).
  return (
    <section className="h-[calc(100dvh-4rem)] w-full">
      <ChocolateBouquetExperience />
    </section>
  );
}

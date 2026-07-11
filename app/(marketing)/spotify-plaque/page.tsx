import { SpotifyPlaqueExperience } from "@/features/spotify-plaque/components/spotify-plaque-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Spotify Plaque",
  description:
    "A framed keepsake plaque — a slideshow of your photos, your song playing behind it, and a wrapped gift box that opens to a hidden message.",
  path: "/spotify-plaque",
});

export default function SpotifyPlaquePage() {
  // The experience paints its own themed, full-bleed background; we only hand it
  // the height left under the h-16 (4rem) marketing header.
  return (
    <section className="w-full">
      <SpotifyPlaqueExperience className="min-h-[calc(100dvh-4rem)]" />
    </section>
  );
}

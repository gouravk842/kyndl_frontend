import { Suspense } from "react";

import { SpotifyPlaqueBuilder } from "@/features/spotify-plaque/components/builder/spotify-plaque-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Spotify Plaque",
  description:
    "Upload your photos and your song, write a hidden message for the gift box, and save it to share as a framed keepsake plaque.",
  path: "/spotify-plaque/build",
});

export default function SpotifyPlaqueBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <SpotifyPlaqueBuilder />
    </Suspense>
  );
}

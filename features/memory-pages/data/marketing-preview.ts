import type { MemoryPagesDoc } from "../types";

/**
 * A *filled* album used only for the Memory Pages product-page hero demo — it
 * carries real photos so the auto-flipping preview looks like a finished book.
 * Kept separate from `sampleAlbum` (the builder starter), which is intentionally
 * photo-less so a brand-new album opens with empty slots to fill.
 *
 * Photos are seeded picsum images (deterministic "random" pictures) resolved
 * through `previewAssets`, so the demo needs no uploads and looks the same on
 * every visit.
 */
export const previewAlbum: MemoryPagesDoc = {
  title: "Us, This Year",
  subtitle: "the small moments, kept",
  coverColor: "#3a2a25",
  coverPhoto: { fileId: "ph-cover" },
  pages: [
    {
      id: "p1",
      layout: "duo",
      theme: "paper",
      entries: [
        {
          id: "e1",
          photo: { fileId: "ph-1" },
          title: "Golden Hour",
          caption: "Amalfi Coast, Italy",
          body: "We stopped the car just to watch the light fall into the sea — you said we should remember this one exactly.",
        },
        {
          id: "e2",
          photo: { fileId: "ph-2" },
          title: "The Long Way Home",
          caption: "Big Sur, California",
          body: "No map, no plan, the windows down. Somehow every wrong turn was the right one.",
        },
      ],
    },
    {
      id: "p2",
      layout: "single",
      theme: "paper",
      entries: [
        {
          id: "e3",
          photo: { fileId: "ph-3" },
          title: "First Snow",
          caption: "Hallstatt, Austria",
          body: "The whole village went quiet under the white. We stayed out far too long, just for the hush of it.",
        },
      ],
    },
    {
      id: "p3",
      layout: "duo",
      theme: "paper",
      entries: [
        {
          id: "e4",
          photo: { fileId: "ph-4" },
          title: "Coffee & Maps",
          caption: "Lisbon, Portugal",
          body: "Morning light, a torn city map, and a plan we never actually followed.",
        },
        {
          id: "e5",
          photo: { fileId: "ph-5" },
          title: "Us, Unposed",
          caption: "Santorini, Greece",
          body: "You weren't ready and neither was I — which is exactly why it's my favourite.",
        },
      ],
    },
    {
      id: "p4",
      layout: "single",
      theme: "paper",
      entries: [
        {
          id: "e6",
          photo: { fileId: "ph-6" },
          title: "One Last Light",
          caption: "Santorini, Greece",
          body: "We said one more photo, then stayed for the whole sunset. Some pages you never want to turn.",
        },
      ],
    },
  ],
};

/**
 * fileId → image URL for the preview album. Seeded picsum photos give the same
 * warm, deterministic "random" pictures on every render.
 */
export const previewAssets: Record<string, string> = {
  "ph-cover": "https://picsum.photos/seed/kyndl-cover/300/300",
  "ph-1": "https://picsum.photos/seed/kyndl-amalfi/640/480",
  "ph-2": "https://picsum.photos/seed/kyndl-bigsur/640/480",
  "ph-3": "https://picsum.photos/seed/kyndl-hallstatt/640/480",
  "ph-4": "https://picsum.photos/seed/kyndl-lisbon/640/480",
  "ph-5": "https://picsum.photos/seed/kyndl-santorini/640/480",
  "ph-6": "https://picsum.photos/seed/kyndl-sunset/640/480",
};

"use client";

import type { ComponentType } from "react";

import { MemoryPagesExperience } from "@/features/memory-pages/components/memory-pages-experience";
import { OurPlacesPreview } from "@/features/our-places/components/our-places-preview";
import { ScrapbookExperience } from "@/features/scrapbook/components/scrapbook-experience";

/**
 * Live experiences that render inline on their product page. `embedded` types
 * (scrapbook) replace the whole hero with the real, interactive experience;
 * `inlineEmbed` types (our-places) show a purpose-built, non-interactive preview
 * inside the right-hand card of the two-column hero, with "Open full screen"
 * launching the real thing at its standalone route.
 */
const embeds: Record<string, ComponentType> = {
  scrapbook: ScrapbookExperience,
  "our-places": OurPlacesPreview,
  "memory-pages": MemoryPagesExperience,
};

export function EmbeddedExperience({ slug }: { slug: string }) {
  const Embed = embeds[slug];
  return Embed ? <Embed /> : null;
}

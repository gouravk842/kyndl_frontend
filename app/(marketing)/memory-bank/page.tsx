import { ROUTES } from "@/constants/routes";
import { MemoryBankStory } from "@/features/memory-bank/components/story/memory-bank-story";
import { createMetadata } from "@/lib/seo";
import { requireSiteFeature } from "@/lib/server/require-site-feature";

export const metadata = createMetadata({
  title: "The days you meant to keep",
  description:
    "Memory Bank holds the photos, notes, and little days you don’t want to lose.",
  path: ROUTES.memoryBankStory,
});

export default async function MemoryBankStoryPage() {
  await requireSiteFeature("show_memory_bank");
  return <MemoryBankStory />;
}

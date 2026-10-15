import { ROUTES } from "@/constants/routes";
import { KyndStory } from "@/features/kynd/components/story/kynd-story";
import { createMetadata } from "@/lib/seo";
import { requireSiteFeature } from "@/lib/server/require-site-feature";

export const metadata = createMetadata({
  title: "The little things matter",
  description:
    "Kynd remembers the things you notice about the people you love.",
  path: ROUTES.kyndStory,
});

export default async function KyndStoryPage() {
  await requireSiteFeature("show_kynd");
  return <KyndStory />;
}

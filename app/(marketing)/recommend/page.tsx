import { ROUTES } from "@/constants/routes";
import { RecommendQuiz } from "@/features/recommendations/components/recommend-quiz";
import { createMetadata } from "@/lib/seo";
import { requireSiteFeature } from "@/lib/server/require-site-feature";

export const metadata = createMetadata({
  title: "Find the right gift",
  description:
    "Answer a few questions and Kyndl will suggest digital keepsakes and physical gifts that belong together.",
  path: ROUTES.recommend,
});

export default async function RecommendPage() {
  await requireSiteFeature("show_recommend");
  return <RecommendQuiz />;
}

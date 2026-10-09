import { ROUTES } from "@/constants/routes";
import { RecommendQuiz } from "@/features/recommendations/components/recommend-quiz";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Find the right gift",
  description:
    "Answer a few questions and Kyndl will suggest digital keepsakes and physical gifts that belong together.",
  path: ROUTES.recommend,
});

export default function RecommendPage() {
  return <RecommendQuiz />;
}

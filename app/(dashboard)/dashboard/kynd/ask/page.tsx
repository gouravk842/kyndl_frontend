import { ROUTES } from "@/constants/routes";
import { KyndChat } from "@/features/kynd/components/kynd-chat";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Ask Kynd",
  description: "What would you like to remember?",
  path: ROUTES.kyndAsk,
  noIndex: true,
});

export default function KyndAskPage() {
  return <KyndChat />;
}

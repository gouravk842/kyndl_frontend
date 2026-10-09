import { ROUTES } from "@/constants/routes";
import { KyndChat } from "@/features/kynd/components/kynd-chat";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Ask Kynd",
  description: "Ask about what you've saved.",
  path: ROUTES.kynd,
  noIndex: true,
});

type Props = { params: Promise<{ personId: string }> };

export default async function KyndPersonAskPage({ params }: Props) {
  const { personId } = await params;
  return <KyndChat personId={personId} />;
}

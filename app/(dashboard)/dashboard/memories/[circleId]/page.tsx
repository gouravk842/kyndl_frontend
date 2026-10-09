import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Bank",
  description: "Memories that belong to one bank.",
  path: ROUTES.memories,
  noIndex: true,
});

type Props = { params: Promise<{ circleId: string }> };

export default async function MemoryCirclePage({ params }: Props) {
  await params;
  return null;
}

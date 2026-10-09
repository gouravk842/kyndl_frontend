import { ROUTES } from "@/constants/routes";
import { KyndPerson } from "@/features/kynd/components/kynd-person";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Kynd",
  description: "Things I know about them.",
  path: ROUTES.kynd,
  noIndex: true,
});

type Props = { params: Promise<{ personId: string }> };

export default async function KyndPersonPage({ params }: Props) {
  const { personId } = await params;
  return <KyndPerson personId={personId} />;
}

import type { Metadata } from "next";

import { PublicCreationViewer } from "@/features/public-viewer/public-creation-viewer";
import { createMetadata } from "@/lib/seo";
import { getSharePageMeta } from "@/lib/server/share-meta";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const meta = await getSharePageMeta(token);
  return createMetadata({
    title: meta.title,
    description: meta.description,
    path: `/v/${token}`,
    image: meta.image,
    noIndex: true,
  });
}

export default async function PublicCreationPage({ params }: PageProps) {
  const { token } = await params;
  return <PublicCreationViewer token={token} />;
}

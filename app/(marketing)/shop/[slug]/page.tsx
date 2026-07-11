import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import { StoreFront } from "@/features/gifts/components/store-front";
import { createMetadata } from "@/lib/seo";
import { getGiftStore } from "@/lib/server/gifts";

// Stock and pricing are backend-controlled; fetch fresh per request.
export const dynamic = "force-dynamic";

// In this Next version, route params are async.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const store = await getGiftStore(slug);
  if (!store) return createMetadata({ title: "Shop", path: `${ROUTES.storefront}/${slug}` });
  return createMetadata({
    title: store.name,
    description: store.description || `Gifts from ${store.name} on Kyndl.`,
    path: `${ROUTES.storefront}/${slug}`,
  });
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getGiftStore(slug);
  if (!store) notFound();

  return (
    <PageContainer size="xl" className="py-12 md:py-16">
      <StoreFront store={store} />
    </PageContainer>
  );
}

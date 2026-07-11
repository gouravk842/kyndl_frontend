import { notFound } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { ProductDetail } from "@/features/gifts/components/product-detail";
import { createMetadata } from "@/lib/seo";
import { getGiftProduct } from "@/lib/server/gifts";

// Stock and pricing are backend-controlled; fetch fresh per request.
export const dynamic = "force-dynamic";

// In this Next version, route params are async.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getGiftProduct(slug);
  if (!product) return createMetadata({ title: "Gift", path: `${ROUTES.gifts}/${slug}` });
  return createMetadata({
    title: product.name,
    description: product.tagline || product.description || `Send ${product.name} with Kyndl.`,
    path: `${ROUTES.gifts}/${slug}`,
  });
}

export default async function GiftProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getGiftProduct(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}

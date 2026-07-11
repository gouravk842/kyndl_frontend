import { EditProduct } from "@/features/vendor/components/edit-product";
import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Edit product",
  description: "Update a gift in your shop.",
  path: "/dashboard/shop/products",
  noIndex: true,
});

// In this Next version, route params are async.
type Props = { params: Promise<{ slug: string }> };

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  return (
    <VendorGuard>
      <EditProduct slug={slug} />
    </VendorGuard>
  );
}

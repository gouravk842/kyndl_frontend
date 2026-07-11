import { ProductForm } from "@/features/vendor/components/product-form";
import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "New product",
  description: "List a new gift in your shop.",
  path: "/dashboard/shop/products/new",
  noIndex: true,
});

export default function NewProductPage() {
  return (
    <VendorGuard>
      <ProductForm />
    </VendorGuard>
  );
}

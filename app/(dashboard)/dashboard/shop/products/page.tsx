import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { VendorProducts } from "@/features/vendor/components/vendor-products";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Products",
  description: "Manage the gifts your shop sells.",
  path: "/dashboard/shop/products",
  noIndex: true,
});

export default function ShopProductsPage() {
  return (
    <VendorGuard>
      <VendorProducts />
    </VendorGuard>
  );
}

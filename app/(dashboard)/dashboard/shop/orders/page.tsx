import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { VendorOrders } from "@/features/vendor/components/vendor-orders";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Shop orders",
  description: "Pack and ship your customers' orders.",
  path: "/dashboard/shop/orders",
  noIndex: true,
});

export default function ShopOrdersPage() {
  return (
    <VendorGuard>
      <VendorOrders />
    </VendorGuard>
  );
}

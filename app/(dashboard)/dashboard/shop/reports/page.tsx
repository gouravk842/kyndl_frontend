import { ShopPnLReport } from "@/features/vendor/components/shop-pnl";
import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Shop profit & loss",
  description: "Earnings minus expenses for your shop.",
  path: "/dashboard/shop/reports",
  noIndex: true,
});

export default function ShopReportsPage() {
  return (
    <VendorGuard>
      <ShopPnLReport />
    </VendorGuard>
  );
}

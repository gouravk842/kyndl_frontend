import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { VendorOverview } from "@/features/vendor/components/vendor-overview";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Shop overview",
  description: "Your shop's earnings and fulfillment.",
  path: "/dashboard/shop",
  noIndex: true,
});

export default function ShopOverviewPage() {
  return (
    <VendorGuard>
      <VendorOverview />
    </VendorGuard>
  );
}

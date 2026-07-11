import { ShopSettings } from "@/features/vendor/components/shop-settings";
import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Shop settings",
  description: "Manage your shop details and shipping.",
  path: "/dashboard/shop/settings",
  noIndex: true,
});

export default function ShopSettingsPage() {
  return (
    <VendorGuard>
      <ShopSettings />
    </VendorGuard>
  );
}

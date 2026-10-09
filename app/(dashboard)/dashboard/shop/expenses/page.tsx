import { ShopExpenses } from "@/features/vendor/components/shop-expenses";
import { VendorGuard } from "@/features/vendor/components/vendor-guard";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Shop expenses",
  description: "Track operating costs for your shop.",
  path: "/dashboard/shop/expenses",
  noIndex: true,
});

export default function ShopExpensesPage() {
  return (
    <VendorGuard>
      <ShopExpenses />
    </VendorGuard>
  );
}

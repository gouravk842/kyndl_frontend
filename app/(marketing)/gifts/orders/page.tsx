import { Suspense } from "react";

import { ROUTES } from "@/constants/routes";
import { OrdersView } from "@/features/gifts/components/orders-view";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Your orders",
  description: "Track your Kyndl gift orders.",
  path: ROUTES.giftOrders,
});

export default function GiftOrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersView />
    </Suspense>
  );
}

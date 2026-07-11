import { ROUTES } from "@/constants/routes";
import { CheckoutView } from "@/features/gifts/components/checkout-view";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Checkout",
  description: "Complete your Kyndl gift order.",
  path: ROUTES.checkout,
});

export default function CheckoutPage() {
  return <CheckoutView />;
}

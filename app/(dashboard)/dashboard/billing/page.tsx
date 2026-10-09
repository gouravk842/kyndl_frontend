import { ROUTES } from "@/constants/routes";
import { BillingView } from "@/features/billing/components/billing-view";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Billing",
  description: "Download invoices for your Kyndl purchases.",
  path: ROUTES.billing,
  noIndex: true,
});

export default function BillingPage() {
  return <BillingView />;
}

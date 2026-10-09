import { ROUTES } from "@/constants/routes";
import { ReferralsView } from "@/features/referrals/components/referrals-view";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Referrals",
  description: "Share Kyndl products and track referral conversions.",
  path: ROUTES.referrals,
  noIndex: true,
});

export default function ReferralsPage() {
  return <ReferralsView />;
}

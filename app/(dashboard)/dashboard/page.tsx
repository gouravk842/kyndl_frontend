import { DashboardWorkspace } from "@/features/dashboard/components/dashboard-workspace";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Your Kyndl studio — the memories you make and share",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardPage() {
  return <DashboardWorkspace />;
}

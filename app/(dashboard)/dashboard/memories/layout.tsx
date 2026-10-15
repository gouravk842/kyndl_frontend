import { MemoriesRouteLayout } from "@/features/memory-bank/components/memories-route-layout";
import { requireSiteFeature } from "@/lib/server/require-site-feature";

export default async function MemoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSiteFeature("show_memory_bank");
  return <MemoriesRouteLayout>{children}</MemoriesRouteLayout>;
}

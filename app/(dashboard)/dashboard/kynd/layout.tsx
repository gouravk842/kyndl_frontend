import { requireSiteFeature } from "@/lib/server/require-site-feature";

export default async function KyndLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSiteFeature("show_kynd");
  return children;
}

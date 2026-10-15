import { notFound } from "next/navigation";

import { getSiteSettings } from "@/lib/server/site-settings";

/** Referrals stay on the full product (v1); hide in ecommerce-first mode. */
export default async function ReferralsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  if (settings.site_mode === "v2") notFound();
  return children;
}

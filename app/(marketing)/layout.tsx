import { PageTransition } from "@/components/animations/page-transition";
import { PageLoader } from "@/components/landing/page-loader";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { KyndlLogo } from "@/components/shared/kyndl-logo";
import { SiteSettingsProvider } from "@/components/site-settings/site-settings-provider";
import { getSiteSettings } from "@/lib/server/site-settings";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await getSiteSettings();

  return (
    <SiteSettingsProvider value={siteSettings}>
      <div className="min-h-full bg-[#FFF7F1] text-[#3A2A25]">
        <PageLoader intro={<KyndlLogo size="loader" animated />} />
        <MarketingHeader />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <MarketingFooter />
      </div>
    </SiteSettingsProvider>
  );
}

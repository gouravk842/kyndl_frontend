import { PageTransition } from "@/components/animations/page-transition";
import { PageLoader } from "@/components/landing/page-loader";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { KyndlLogo } from "@/components/shared/kyndl-logo";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-full bg-[#090909] text-[#F5E9E2]">
      <PageLoader intro={<KyndlLogo size="loader" animated />} />
      <MarketingHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <MarketingFooter />
    </div>
  );
}

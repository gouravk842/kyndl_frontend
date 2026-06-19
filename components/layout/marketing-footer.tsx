import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

const footerLinks = [
  { href: "#gift-catalog", label: "Digital gifts" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#showcase", label: "Interactive demo" },
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.login, label: "Log in" },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#090909] py-16">
      <PageContainer
        size="xl"
        className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between"
      >
        <div className="space-y-3 max-w-sm">
          <Logo />
          <p className="text-sm leading-relaxed text-[#B3B3B3]">
            {siteConfig.description}
          </p>
        </div>
        <nav className="flex flex-wrap gap-8 text-sm" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#B3B3B3] transition-colors hover:text-[#F5E9E2]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-[#B3B3B3] md:text-right">
          © {year} {siteConfig.creator}
        </p>
      </PageContainer>
    </footer>
  );
}

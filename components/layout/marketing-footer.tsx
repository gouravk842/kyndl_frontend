import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/config/site";
import { EXPERIENCE_CATEGORIES } from "@/constants/experience-taxonomy";
import { ROUTES } from "@/constants/routes";

/**
 * Footer as an honest sitemap. The "Experiences" column mirrors the header's
 * shelves (from the shared taxonomy) so the two navigation surfaces agree, and
 * the other columns surface every real destination — Gifts, Games, account —
 * so the footer works as a genuine navigation fallback.
 */
const linkColumns = [
  {
    title: "Experiences",
    links: [
      { href: ROUTES.memoryBankStory, label: "Memory Bank" },
      { href: ROUTES.kyndStory, label: "Kynd" },
      ...EXPERIENCE_CATEGORIES.map((c) => ({
        href: `${ROUTES.experiences}#${c.id}`,
        label: c.label,
      })),
      { href: ROUTES.experiences, label: "See all →" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: ROUTES.gifts, label: "Physical gifts" },
      { href: ROUTES.giftWishlist, label: "Wishlist" },
      { href: ROUTES.giftOrders, label: "My orders" },
      { href: ROUTES.games, label: "Games" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: ROUTES.pricing, label: "Pricing" },
      { href: ROUTES.about, label: "About" },
      { href: ROUTES.blog, label: "Blog" },
      { href: ROUTES.feedback, label: "Share feedback" },
      { href: ROUTES.ideas, label: "Submit an idea" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: ROUTES.terms, label: "Terms" },
      { href: ROUTES.privacy, label: "Privacy" },
      { href: ROUTES.refund, label: "Refunds" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: ROUTES.login, label: "Log in" },
      { href: ROUTES.register, label: "Get started" },
      { href: ROUTES.dashboard, label: "Dashboard" },
    ],
  },
] as const;

const socialLinks = [
  {
    href: siteConfig.links.twitter,
    label: "Twitter",
    icon: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  {
    href: siteConfig.links.github,
    label: "GitHub",
    icon: (
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    ),
  },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[#F2DACE] bg-[#FCEEE3]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FF7A59]/15 to-[#F2596F]/15 blur-3xl"
      />

      <PageContainer size="xl" className="relative py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          {/* Brand */}
          <div className="max-w-sm space-y-4">
            <Logo className="[&_text]:fill-[#3A2A25]" />
            <p className="text-sm leading-relaxed text-[#7A6258]">
              Keep the days in a Memory Bank, then grow them into something they
              can hold — a scrapbook, a sky, a jar — sent with a private link.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-[#F2DACE] bg-white/60 text-[#7A6258] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF7A59]/50 hover:text-[#3A2A25]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                    aria-hidden
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {linkColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-xs font-semibold tracking-[0.16em] text-[#92786C] uppercase">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#7A6258] transition-colors duration-300 hover:text-[#3A2A25]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-[#F2DACE] pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-[#92786C]">
            © {year} {siteConfig.creator}. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[#92786C]"
          >
            <Link
              href={ROUTES.terms}
              className="transition-colors duration-300 hover:text-[#3A2A25]"
            >
              Terms
            </Link>
            <Link
              href={ROUTES.privacy}
              className="transition-colors duration-300 hover:text-[#3A2A25]"
            >
              Privacy
            </Link>
            <Link
              href={ROUTES.refund}
              className="transition-colors duration-300 hover:text-[#3A2A25]"
            >
              Refunds
            </Link>
          </nav>
        </div>
      </PageContainer>
    </footer>
  );
}

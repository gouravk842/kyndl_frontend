"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Logo } from "@/components/shared/logo";
import { useSiteSettings } from "@/components/site-settings/site-settings-provider";
import { siteConfig } from "@/config/site";
import { EXPERIENCE_CATEGORIES } from "@/constants/experience-taxonomy";
import { ROUTES } from "@/constants/routes";

type FooterLink = { href: string; label: string };
type FooterColumn = { title: string; links: FooterLink[] };

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
  const settings = useSiteSettings();
  const isV2 = settings.site_mode === "v2";

  const experienceLinks: FooterLink[] = [
    ...(settings.show_memory_bank
      ? [{ href: ROUTES.memoryBankStory, label: "Memory Bank" }]
      : []),
    ...(settings.show_kynd ? [{ href: ROUTES.kyndStory, label: "Kynd" }] : []),
    ...(settings.show_experiences
      ? [
          ...EXPERIENCE_CATEGORIES.map((c) => ({
            href: `${ROUTES.experiences}#${c.id}`,
            label: c.label,
          })),
          { href: ROUTES.experiences, label: "See all →" },
        ]
      : []),
  ];

  const shopLinks: FooterLink[] = [
    ...(settings.show_gifts
      ? [
          { href: ROUTES.gifts, label: "Physical gifts" },
          { href: ROUTES.giftWishlist, label: "Wishlist" },
          { href: ROUTES.giftOrders, label: "My orders" },
        ]
      : []),
    ...(settings.show_games ? [{ href: ROUTES.games, label: "Games" }] : []),
  ];

  const companyLinks: FooterLink[] = [
    ...(settings.show_pricing
      ? [{ href: ROUTES.pricing, label: "Pricing" }]
      : []),
    { href: ROUTES.feedback, label: "Share feedback" },
    { href: ROUTES.ideas, label: "Submit an idea" },
  ];

  const linkColumns: FooterColumn[] = [
    ...(experienceLinks.length
      ? [{ title: "Experiences", links: experienceLinks }]
      : []),
    ...(shopLinks.length ? [{ title: "Shop", links: shopLinks }] : []),
    { title: "Company", links: companyLinks },
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
  ];

  const blurb = isV2
    ? "Thoughtful gifts and digital keepsakes — personalize in minutes, send with a private link, or ship something they can hold."
    : "Keep the days in a Memory Bank, then grow them into something they can hold — a scrapbook, a sky, a jar — sent with a private link.";

  return (
    <footer className="relative overflow-hidden border-t border-[#F2DACE] bg-[#FCEEE3]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FF7A59]/15 to-[#F2596F]/15 blur-3xl"
      />

      <PageContainer size="xl" className="relative py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="max-w-sm space-y-4">
            <Logo className="[&_text]:fill-[#3A2A25]" />
            <p className="text-sm leading-relaxed text-[#7A6258]">{blurb}</p>
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
                        prefetch={false}
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
              prefetch={false}
              className="transition-colors duration-300 hover:text-[#3A2A25]"
            >
              Terms
            </Link>
            <Link
              href={ROUTES.privacy}
              prefetch={false}
              className="transition-colors duration-300 hover:text-[#3A2A25]"
            >
              Privacy
            </Link>
            <Link
              href={ROUTES.refund}
              prefetch={false}
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

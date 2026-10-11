import { Check, Gift, Heart, type LucideIcon, Sparkles } from "lucide-react";
import Link from "next/link";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { createMetadata } from "@/lib/seo";
import {
  getPricingPage,
  type PricingPageCardIcon,
} from "@/lib/server/pricing-page";

export const metadata = createMetadata({
  title: "Pricing",
  description:
    "No subscriptions. Make and preview any Kyndl for free, then pay once per keepsake only when you're ready to send it. Physical gifts are priced per item.",
  path: "/pricing",
});

export const dynamic = "force-dynamic";

const CARD_ICONS: Record<PricingPageCardIcon, LucideIcon> = {
  sparkles: Sparkles,
  heart: Heart,
  gift: Gift,
};

function ComingSoonState({
  eyebrow,
  title,
  titleAccent,
  message,
}: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  message: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <PageHeader
        eyebrow={eyebrow}
        title={
          titleAccent ? (
            <>
              {title} <span className="kyndl-text-warm">{titleAccent}</span>
            </>
          ) : (
            title || "Pricing"
          )
        }
        subtitle={message}
      />
    </div>
  );
}

export default async function PricingPage() {
  const page = await getPricingPage();

  if (!page || page.status === "coming_soon") {
    return (
      <ComingSoonState
        eyebrow={page?.eyebrow ?? "Pricing"}
        title={page?.title ?? "Pricing"}
        titleAccent={page?.title_accent}
        message={page?.message || "Pricing details coming soon."}
      />
    );
  }

  const { primary_cta: primary, secondary_cta: secondary } = page;

  return (
    <div className="relative overflow-hidden">
      <PageHeader
        eyebrow={page.eyebrow}
        title={
          page.title_accent ? (
            <>
              {page.title}{" "}
              <span className="kyndl-text-warm">{page.title_accent}</span>
            </>
          ) : (
            page.title
          )
        }
        subtitle={page.subtitle || undefined}
      />

      <section className="relative py-12 md:py-16">
        <PageContainer size="xl">
          {page.cards.length > 0 && (
            <div className="grid gap-5 md:grid-cols-3">
              {page.cards.map((tier) => {
                const Icon = CARD_ICONS[tier.icon] ?? Sparkles;
                return (
                  <div
                    key={tier.title}
                    className={
                      "kyndl-card-soft relative flex flex-col rounded-3xl border bg-white p-7 " +
                      (tier.highlighted
                        ? "border-[#FF7A59]/45 shadow-[0_28px_64px_-26px_rgba(242,89,111,0.4)]"
                        : "border-[#F4DDD0]")
                    }
                  >
                    {tier.highlighted && tier.badge && (
                      <span className="absolute right-6 top-7 rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-3 py-1 text-[11px] font-medium tracking-wider text-white uppercase">
                        {tier.badge}
                      </span>
                    )}
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59]">
                      <Icon className="size-6" />
                    </span>
                    <h2 className="mt-5 font-display text-xl text-[#3A2A25]">
                      {tier.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
                      {tier.body}
                    </p>
                    {tier.points.length > 0 && (
                      <ul className="mt-5 space-y-2.5 border-t border-[#F4DDD0] pt-5">
                        {tier.points.map((p) => (
                          <li
                            key={p}
                            className="flex items-center gap-2.5 text-sm text-[#3A2A25]"
                          >
                            <Check className="size-4 shrink-0 text-[#C75B39]" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {page.faqs.length > 0 && (
            <div className="mx-auto mt-16 max-w-3xl">
              <h3 className="text-center font-display text-2xl text-[#3A2A25] md:text-3xl">
                {page.faq_title}
              </h3>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {page.faqs.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-[#F4DDD0] bg-white/70 p-5 backdrop-blur-sm"
                  >
                    <p className="font-medium text-[#3A2A25]">
                      {item.question}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(primary.label || secondary.label) && (
            <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
              {primary.label && primary.href && (
                <KyndlButton size="lg" href={primary.href}>
                  {primary.label}
                </KyndlButton>
              )}
              {secondary.label && secondary.href && (
                <Link
                  href={secondary.href}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#F2DACE] bg-white/70 px-8 text-base font-medium text-[#3A2A25] transition-all duration-300 hover:border-[#FF7A59]/50 hover:bg-white"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          )}
        </PageContainer>
      </section>
    </div>
  );
}

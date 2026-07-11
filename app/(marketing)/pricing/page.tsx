import { Check, Gift, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Pricing",
  description:
    "No subscriptions. Make and preview any Kyndl for free, then pay once per keepsake only when you're ready to send it. Physical gifts are priced per item.",
  path: "/pricing",
});

// Kyndl is freemium-per-item, not a SaaS with seats/tiers. These cards explain
// the real model; exact prices are set per experience and shown on each one.
const MODEL = [
  {
    icon: Sparkles,
    title: "Free to make",
    body: "Build and preview any experience in full — add your photos, words, and secrets. You only decide to pay once it feels right.",
    points: [
      "Every experience, free to try",
      "No card to start",
      "No time limit",
    ],
  },
  {
    icon: Heart,
    title: "Pay once to send",
    body: "When you're ready to share, unlock your keepsake with a single one-time payment. The price is shown on each experience before you commit.",
    points: [
      "One-time, per keepsake",
      "No subscription, ever",
      "Yours to keep & re-share",
    ],
    highlighted: true,
  },
  {
    icon: Gift,
    title: "Gifts, priced per item",
    body: "Physical treasures in the gift shop are priced individually, with free shipping over ₹999 and everything wrapped with a note.",
    points: [
      "Transparent item pricing",
      "Free shipping over ₹999",
      "Tracked delivery",
    ],
  },
];

const FAQ = [
  {
    q: "Is there a subscription?",
    a: "No. Kyndl is pay-as-you-go — you only ever pay once, per keepsake you send, or per gift you order. Nothing recurring.",
  },
  {
    q: "How much does a keepsake cost?",
    a: "It depends on the experience. Some are free, others are a small one-time price shown clearly on the experience before you pay.",
  },
  {
    q: "Can I try before I pay?",
    a: "Always. You can build and preview any experience completely free, and only pay when you're ready to share it.",
  },
  {
    q: "What do I actually get?",
    a: "A private link to a personalized experience your person can open anytime — plus the ability to re-share it whenever you like.",
  },
];

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      <PageHeader
        eyebrow="Pricing"
        title={
          <>
            No plans. No seats.{" "}
            <span className="kyndl-text-warm">Just moments.</span>
          </>
        }
        subtitle="Kyndl isn't a subscription. Make and preview anything for free — then pay once, only for the keepsake you actually send."
      />

      <section className="relative py-12 md:py-16">
        <PageContainer size="xl">
          <div className="grid gap-5 md:grid-cols-3">
            {MODEL.map((tier) => (
              <div
                key={tier.title}
                className={
                  "kyndl-card-soft relative flex flex-col rounded-3xl border bg-white p-7 " +
                  (tier.highlighted
                    ? "border-[#FF7A59]/45 shadow-[0_28px_64px_-26px_rgba(242,89,111,0.4)]"
                    : "border-[#F4DDD0]")
                }
              >
                {tier.highlighted && (
                  <span className="absolute right-6 top-7 rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-3 py-1 text-[11px] font-medium tracking-wider text-white uppercase">
                    Most send
                  </span>
                )}
                <span className="flex size-12 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59]">
                  <tier.icon className="size-6" />
                </span>
                <h2 className="mt-5 font-display text-xl text-[#3A2A25]">
                  {tier.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
                  {tier.body}
                </p>
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
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mx-auto mt-16 max-w-3xl">
            <h3 className="text-center font-display text-2xl text-[#3A2A25] md:text-3xl">
              Questions, answered
            </h3>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-[#F4DDD0] bg-white/70 p-5 backdrop-blur-sm"
                >
                  <p className="font-medium text-[#3A2A25]">{item.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            <KyndlButton size="lg" href={ROUTES.experiences}>
              Browse experiences
            </KyndlButton>
            <Link
              href={ROUTES.gifts}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#F2DACE] bg-white/70 px-8 text-base font-medium text-[#3A2A25] transition-all duration-300 hover:border-[#FF7A59]/50 hover:bg-white"
            >
              Visit the gift shop
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

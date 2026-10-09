"use client";

import { ArrowRight, Dices, Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { AgeConsentDialog } from "@/components/red-zone/age-consent-dialog";
import { ROUTES } from "@/constants/routes";
import { hasRedZoneConsent, setRedZoneConsent } from "@/lib/red-zone-consent";

export function PlayAndNight() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  const goRedZone = () => {
    if (hasRedZoneConsent()) {
      router.push(ROUTES.redZone);
    } else {
      setAsking(true);
    }
  };

  return (
    <section className="relative py-20 md:py-28">
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Not only keepsakes
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl text-[#3A2A25] md:text-4xl">
            Play together.
            <br />
            <span className="text-[#B08C7D]">Or turn the lights down.</span>
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <FadeIn>
            <Link
              href={ROUTES.games}
              className="kyndl-card-soft group flex h-full flex-col rounded-3xl border border-[#F4DDD0] bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45 hover:shadow-[0_28px_64px_-26px_rgba(242,89,111,0.4)]"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59]">
                <Dices className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-2xl text-[#3A2A25]">
                Games for two
              </h3>
              <p className="mt-2 max-w-md text-[#7A6258]">
                Ludo on the couch, FLAMES on a dare, a folded note like school.
                Silly, shareable, still yours.
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#C75B39]">
                Play the games
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </FadeIn>

          <FadeIn delay={0.08}>
            <button
              type="button"
              onClick={goRedZone}
              className="kyndl-card-soft group flex h-full flex-col rounded-3xl border border-[#F4DDD0] bg-[#FFF7F1] p-7 text-left transition-all duration-500 hover:-translate-y-1 hover:border-[#C2415A]/40 hover:shadow-[0_28px_64px_-26px_rgba(194,65,90,0.35)]"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-white text-[#C2415A]">
                <Flame className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-2xl text-[#3A2A25]">
                Naughty nights
                <span className="ml-2 align-middle text-xs font-medium tracking-[0.16em] text-[#C2415A] uppercase">
                  18+
                </span>
              </h3>
              <p className="mt-2 max-w-md text-[#7A6258]">
                Red Zone — private, playful, and only for the two of you. Same
                Kyndl warmth. A little more heat.
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#C2415A]">
                Enter Red Zone
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </button>
          </FadeIn>
        </div>
      </PageContainer>

      <AgeConsentDialog
        open={asking}
        onConfirm={() => {
          setRedZoneConsent();
          setAsking(false);
          router.push(ROUTES.redZone);
        }}
        onCancel={() => setAsking(false)}
      />
    </section>
  );
}

"use client";

import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AgeConsentDialog } from "@/components/red-zone/age-consent-dialog";
import { ExperienceCardMedia } from "@/components/shared/experience-card-media";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ROUTES } from "@/constants/routes";
import { useMounted } from "@/hooks/use-mounted";
import { experienceHref } from "@/lib/experiences";
import { hasRedZoneConsent, setRedZoneConsent } from "@/lib/red-zone-consent";
import type { ExperienceView } from "@/lib/server/experiences";

/**
 * The adults-only Red Zone section. Gated by an 18+ consent: someone arriving
 * here directly (not via the header link) is asked to confirm before any cards
 * show. Consent is remembered on-device. Each experience still renders its own
 * age gate when actually opened.
 */
export function RedZoneSection({
  experiences,
}: {
  experiences: ExperienceView[];
}) {
  const router = useRouter();
  const mounted = useMounted();
  // Before mount we can't read localStorage, so assume not-yet-consented and
  // let the effect-free `hasRedZoneConsent()` settle it once mounted.
  const [consented, setConsented] = useState(false);

  const ok = mounted && (consented || hasRedZoneConsent());

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden py-16 md:py-20">
      {/* dim, candlelit surface */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium tracking-[0.25em] text-[#ff8fae] uppercase">
              <Flame className="size-4" /> Red Zone · 18+
            </p>
            <h1 className="max-w-2xl font-display text-4xl leading-tight text-white sm:text-5xl">
              Spice up your nights in.
            </h1>
            <p className="mt-4 max-w-2xl text-white/55">
              Adults-only experiences for couples — playful, intimate, and
              entirely yours to customize. Made to be shared by a private link
              only the two of you hold.
            </p>
          </div>
          <Link
            href={ROUTES.home}
            className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm text-white/80 transition-colors hover:border-white/30 hover:bg-white/10"
          >
            ← Back to Home
          </Link>
        </header>

        {ok ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <article
                key={exp.slug}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-[#ff4d6d]/45"
              >
                <ExperienceCardMedia
                  slug={exp.slug}
                  media={exp}
                  className="h-36 rounded-none aspect-auto"
                >
                  <span className="absolute left-5 top-5 flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#ff8fae] backdrop-blur-sm">
                    <ExperienceIcon name={exp.icon} className="size-6" />
                  </span>
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-medium tracking-wider text-[#ff8fae] uppercase backdrop-blur-sm">
                    {exp.eyebrow}
                  </span>
                </ExperienceCardMedia>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl text-white">
                    {exp.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
                    {exp.tagline}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <Link
                      href={experienceHref(exp.slug)}
                      className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                    >
                      Open
                      <ArrowUpRight className="ml-1.5 size-4" />
                    </Link>
                    {exp.makeHref && (
                      <Link
                        href={exp.makeHref}
                        className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                      >
                        Make your own
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {experiences.length === 0 && (
              <p className="text-white/40">More coming soon.</p>
            )}
          </div>
        ) : (
          // Locked state for direct visitors who haven't consented yet.
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-white/40">This space is for adults only.</p>
          </div>
        )}
      </div>

      {/* Ask for consent if they arrived directly without it. */}
      <AgeConsentDialog
        open={mounted && !ok}
        onConfirm={() => {
          setRedZoneConsent();
          setConsented(true);
        }}
        onCancel={() => router.push(ROUTES.home)}
      />
    </section>
  );
}

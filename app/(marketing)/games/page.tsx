import {
  ArrowUpRight,
  Dices,
  Flame,
  Gauge,
  Hammer,
  Mail,
  Percent,
  Split,
} from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { ideaHref } from "@/features/ideas/idea-href";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Games",
  description:
    "Play interactive couple and friends games on Kyndl — FLAMES, Love Calculator, Folded Note, and more.",
  path: "/games",
});

const games = [
  {
    title: "Ludo for Two",
    description:
      "Classic Ludo reimagined for date night — realistic dice, captures, and a tunable couple-activity mode.",
    href: ROUTES.ludo,
    icon: Dices,
  },
  {
    title: "Whack My Face",
    description:
      "Smash their selfie in a tiny arcade, dodge the sacred hearts, and unlock the apology letter at the end.",
    href: ROUTES.whackAMole,
    icon: Hammer,
  },
  {
    title: "FLAMES",
    description:
      "Cancel matching letters and let destiny pick Friends, Lovers, Affection, Marriage, Enemies, or Siblings.",
    href: ROUTES.flames,
    icon: Flame,
  },
  {
    title: "Love Calculator",
    description:
      "Two names in, a silly % out — fake science with a note you wrote underneath.",
    href: ROUTES.loveCalculator,
    icon: Percent,
  },
  {
    title: "Folded Note",
    description:
      "Unfold a schoolyard note, check Yes / No / Maybe, and get the reaction they planted.",
    href: ROUTES.foldedNote,
    icon: Mail,
  },
  {
    title: "This or That",
    description:
      "Rapid A/B taps that grade their vibe on a shareable type card.",
    href: ROUTES.thisOrThat,
    icon: Split,
  },
  {
    title: "Delulu Meter",
    description: "Rate the crush chaos 1–5 and land on a comedy delulu gauge.",
    href: ROUTES.deluluMeter,
    icon: Gauge,
  },
];

export default function GamesPage() {
  return (
    <div className="relative overflow-hidden">
      <PageHeader
        eyebrow="Play together"
        title={
          <>
            Game night, <span className="kyndl-text-warm">just for two.</span>
          </>
        }
        subtitle="Pick a game and start instantly — no setup, no install. More co-op and date-night games are on the way."
      />

      <section className="relative py-12 md:py-16">
        <PageContainer size="xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <article
                key={game.title}
                className="kyndl-card-soft group relative flex flex-col rounded-3xl border border-[#F4DDD0] bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45 hover:shadow-[0_28px_64px_-26px_rgba(242,89,111,0.45)]"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59]">
                    <game.icon className="size-6" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A59]/30 bg-[#FFF1E9] px-3 py-1 text-[11px] font-medium tracking-wider text-[#C75B39] uppercase">
                    <span className="size-1.5 rounded-full bg-[#2fb672]" />
                    Live
                  </span>
                </div>

                <h2 className="mt-6 font-display text-xl text-[#3A2A25]">
                  {game.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#7A6258]">
                  {game.description}
                </p>

                <div className="mt-6">
                  <Link
                    href={game.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C75B39]"
                  >
                    Play now
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <Link
                  href={game.href}
                  className="absolute inset-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2596F]/50"
                  aria-label={`Play ${game.title}`}
                />
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-[1.75rem] border border-[#F4DDD0] bg-white/70 p-6 text-center backdrop-blur-sm md:p-8">
            <p className="text-[#7A6258]">
              Want a game we don&apos;t have yet?{" "}
              <Link
                href={ideaHref({ source: "games" })}
                className="font-semibold text-[#C75B39] hover:text-[#9e3f21]"
              >
                Tell us the night you had in mind →
              </Link>
            </p>
            <p className="mt-3 text-[#7A6258]">
              Looking for something to keep instead?{" "}
              <Link
                href={ROUTES.experiences}
                className="font-semibold text-[#C75B39] hover:text-[#9e3f21]"
              >
                Explore all experiences →
              </Link>
            </p>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

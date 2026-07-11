import { ArrowUpRight, Dices, Heart, Puzzle } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Games",
  description:
    "Play interactive couple and friends games on Kyndl. Start with Ludo for Two and discover more games as they launch.",
  path: "/games",
});

const games = [
  {
    title: "Ludo for Two",
    description:
      "Classic Ludo reimagined for date night — realistic dice, captures, and a tunable couple-activity mode.",
    href: "/games/ludo",
    icon: Dices,
    live: true,
  },
  {
    title: "Truth Spark",
    description: "Quick turn-based prompts to start meaningful conversations.",
    href: "#",
    icon: Heart,
    live: false,
  },
  {
    title: "Memory Match",
    description: "Match little moments, memories, and cute surprises together.",
    href: "#",
    icon: Puzzle,
    live: false,
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
                className={cn(
                  "kyndl-card-soft group relative flex flex-col rounded-3xl border border-[#F4DDD0] bg-white p-6 transition-all duration-500",
                  game.live
                    ? "hover:-translate-y-1 hover:border-[#FF7A59]/45 hover:shadow-[0_28px_64px_-26px_rgba(242,89,111,0.45)]"
                    : "opacity-90",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59]">
                    <game.icon className="size-6" />
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wider uppercase",
                      game.live
                        ? "border border-[#FF7A59]/30 bg-[#FFF1E9] text-[#C75B39]"
                        : "border border-[#3A2A25]/10 bg-[#FFF7F1] text-[#92786C]",
                    )}
                  >
                    {game.live && (
                      <span className="size-1.5 rounded-full bg-[#2fb672]" />
                    )}
                    {game.live ? "Live" : "Coming soon"}
                  </span>
                </div>

                <h2 className="mt-6 font-display text-xl text-[#3A2A25]">
                  {game.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#7A6258]">
                  {game.description}
                </p>

                <div className="mt-6">
                  {game.live ? (
                    <Link
                      href={game.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C75B39]"
                    >
                      Play now
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-[#B5A096]">
                      In the works
                    </span>
                  )}
                </div>

                {game.live && (
                  <Link
                    href={game.href}
                    className="absolute inset-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2596F]/50"
                    aria-label={`Play ${game.title}`}
                  />
                )}
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-[1.75rem] border border-[#F4DDD0] bg-white/70 p-6 text-center backdrop-blur-sm md:p-8">
            <p className="text-[#7A6258]">
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

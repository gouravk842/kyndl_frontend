import Link from "next/link";

import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Games",
  description:
    "Play interactive couple and friends games on Kyndl. Start with Ludo Party and discover more games as they launch.",
  path: "/games",
});

const games = [
  {
    title: "Ludo Party",
    description:
      "A multiplayer Ludo board with activity mode challenges for couples and friends.",
    href: "/games/ludo",
    status: "Live",
  },
  {
    title: "Truth Spark",
    description: "Quick turn-based prompts to start meaningful conversations.",
    href: "#",
    status: "Coming Soon",
  },
  {
    title: "Memory Match",
    description: "Match little moments, memories, and cute surprises together.",
    href: "#",
    status: "Coming Soon",
  },
];

export default function GamesPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-sm tracking-[0.18em] text-[#D4A373] uppercase">
            Play Together
          </p>
          <h1 className="font-display text-4xl text-[#F5E9E2] sm:text-5xl">
            Couple & Friends Games
          </h1>
          <p className="mt-3 max-w-2xl text-[#B3B3B3]">
            Pick a game and start instantly. More co-op and date-night games are
            on the way.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm text-[#F5E9E2] transition-colors hover:border-[#C21830]/40 hover:bg-white/5"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const live = game.status === "Live";
          return (
            <article
              key={game.title}
              className="rounded-3xl border border-white/10 bg-[#111111]/85 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#F5E9E2]">
                  {game.title}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    live
                      ? "border border-[#C21830]/40 bg-[#C21830]/20 text-[#F8D7DB]"
                      : "border border-white/20 bg-white/5 text-[#B3B3B3]"
                  }`}
                >
                  {game.status}
                </span>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#B3B3B3]">
                {game.description}
              </p>
              {live ? (
                <Link
                  href={game.href}
                  className="inline-flex h-11 items-center rounded-full bg-[#B11226] px-5 text-sm font-medium text-[#F5E9E2] transition-all hover:bg-[#C21830]"
                >
                  Open Game
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 cursor-not-allowed items-center rounded-full border border-white/15 px-5 text-sm text-[#7F7F7F]"
                >
                  Coming soon
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

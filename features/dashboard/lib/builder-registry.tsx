"use client";

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

/**
 * The in-app builder for each experience type, so a creation can be edited
 * *inside* the dashboard shell instead of on its standalone `/<type>/build`
 * marketing page. Mirrors `features/public-viewer/registry.tsx`: keyed by the
 * backend `type` slug, each entry is `next/dynamic`-loaded so a builder bundle is
 * only fetched when actually opened.
 *
 * Every entry component is the same one the marketing build page renders and
 * takes no props — it self-resolves the creation `id` from the URL via its sync
 * hook (`useCreationSync` reads `?id=`), which the dashboard edit host keeps in
 * the query string. So embedding needs no new data plumbing.
 */
const BuilderLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#fdf3ec]">
    <p className="animate-pulse font-display text-lg text-[#c75b39]">
      opening your workshop…
    </p>
  </div>
);

function lazyBuilder(
  loader: () => Promise<{ default: ComponentType }>,
): ComponentType {
  return dynamic(loader, { ssr: false, loading: BuilderLoading });
}

const BUILDERS: Record<string, ComponentType> = {
  scrapbook: lazyBuilder(() =>
    import("@/features/scrapbook/components/builder/builder-experience").then(
      (m) => ({ default: m.BuilderExperience }),
    ),
  ),
  "our-places": lazyBuilder(() =>
    import("@/features/our-places/components/builder/our-places-builder").then(
      (m) => ({ default: m.OurPlacesBuilder }),
    ),
  ),
  "memory-jar": lazyBuilder(() =>
    import("@/features/memory-jar/components/builder/memory-jar-builder").then(
      (m) => ({ default: m.MemoryJarBuilder }),
    ),
  ),
  "memory-pages": lazyBuilder(() =>
    import("@/features/memory-pages/components/builder/builder-experience").then(
      (m) => ({ default: m.BuilderExperience }),
    ),
  ),
  constellation: lazyBuilder(() =>
    import("@/features/constellation/components/builder/constellation-builder").then(
      (m) => ({ default: m.ConstellationBuilder }),
    ),
  ),
  "memory-city": lazyBuilder(() =>
    import("@/features/memory-city/components/builder/memory-city-builder").then(
      (m) => ({ default: m.MemoryCityBuilder }),
    ),
  ),
  "memory-lantern": lazyBuilder(() =>
    import("@/features/memory-lantern/components/builder/memory-lantern-builder").then(
      (m) => ({ default: m.MemoryLanternBuilder }),
    ),
  ),
  "chocolate-bouquet": lazyBuilder(() =>
    import("@/features/chocolate-bouquet/components/builder/chocolate-bouquet-builder").then(
      (m) => ({ default: m.ChocolateBouquetBuilder }),
    ),
  ),
  ludo: lazyBuilder(() =>
    import("@/features/ludo/components/builder/ludo-builder").then((m) => ({
      default: m.LudoBuilder,
    })),
  ),
  "whack-a-mole": lazyBuilder(() =>
    import("@/features/whack-a-mole/components/builder/whack-a-mole-builder").then(
      (m) => ({ default: m.WhackAMoleBuilder }),
    ),
  ),
  flames: lazyBuilder(() =>
    import("@/features/flames/components/builder/flames-builder").then((m) => ({
      default: m.FlamesBuilder,
    })),
  ),
  "love-calculator": lazyBuilder(() =>
    import("@/features/love-calculator/components/builder/love-calculator-builder").then(
      (m) => ({ default: m.LoveCalculatorBuilder }),
    ),
  ),
  "folded-note": lazyBuilder(() =>
    import("@/features/folded-note/components/builder/folded-note-builder").then(
      (m) => ({ default: m.FoldedNoteBuilder }),
    ),
  ),
  "this-or-that": lazyBuilder(() =>
    import("@/features/this-or-that/components/builder/this-or-that-builder").then(
      (m) => ({ default: m.ThisOrThatBuilder }),
    ),
  ),
  "delulu-meter": lazyBuilder(() =>
    import("@/features/delulu-meter/components/builder/delulu-meter-builder").then(
      (m) => ({ default: m.DeluluMeterBuilder }),
    ),
  ),
  countdown: lazyBuilder(() =>
    import("@/features/countdown/components/builder/countdown-builder").then(
      (m) => ({ default: m.CountdownBuilder }),
    ),
  ),
  proposal: lazyBuilder(() =>
    import("@/features/moment/components/builder/proposal-builder").then(
      (m) => ({
        default: m.ProposalBuilder,
      }),
    ),
  ),
  "date-ask": lazyBuilder(() =>
    import("@/features/moment/components/builder/date-ask-builder").then(
      (m) => ({
        default: m.DateAskBuilder,
      }),
    ),
  ),
  "mirror-match": lazyBuilder(() =>
    import("@/features/mirror-match/components/builder/mirror-builder").then(
      (m) => ({ default: m.MirrorBuilder }),
    ),
  ),
  "desire-deck": lazyBuilder(() =>
    import("@/features/desire-deck/components/builder/desire-deck-builder").then(
      (m) => ({ default: m.DesireDeckBuilder }),
    ),
  ),
  "desire-matcher": lazyBuilder(() =>
    import("@/features/desire-matcher/components/builder/matcher-builder").then(
      (m) => ({ default: m.MatcherBuilder }),
    ),
  ),
  "dice-of-desire": lazyBuilder(() =>
    import("@/features/dice-of-desire/components/builder/dice-of-desire-builder").then(
      (m) => ({ default: m.DiceOfDesireBuilder }),
    ),
  ),
  "love-coupons": lazyBuilder(() =>
    import("@/features/love-coupons/components/builder/coupon-book-builder").then(
      (m) => ({ default: m.CouponBookBuilder }),
    ),
  ),
  "naughty-spins": lazyBuilder(() =>
    import("@/features/naughty-spins/components/builder/naughty-spins-builder").then(
      (m) => ({ default: m.NaughtySpinsBuilder }),
    ),
  ),
  "snakes-and-lovers": lazyBuilder(() =>
    import("@/features/snakes-and-lovers/components/builder/snakes-and-lovers-builder").then(
      (m) => ({ default: m.SnakesAndLoversBuilder }),
    ),
  ),
  "spotify-plaque": lazyBuilder(() =>
    import("@/features/spotify-plaque/components/builder/spotify-plaque-builder").then(
      (m) => ({ default: m.SpotifyPlaqueBuilder }),
    ),
  ),
  "string-frame": lazyBuilder(() =>
    import("@/features/string-frame/components/builder/string-frame-builder").then(
      (m) => ({ default: m.StringFrameBuilder }),
    ),
  ),
  "timeless-treasure": lazyBuilder(() =>
    import("@/features/timeless-treasure/components/builder/timeless-treasure-builder").then(
      (m) => ({ default: m.TimelessTreasureBuilder }),
    ),
  ),
  "time-capsule": lazyBuilder(() =>
    import("@/features/time-capsule/components/builder/time-capsule-builder").then(
      (m) => ({ default: m.TimeCapsuleBuilder }),
    ),
  ),
  "twenty-four-reasons": lazyBuilder(() =>
    import("@/features/twenty-four-reasons/components/builder/reasons-builder").then(
      (m) => ({ default: m.ReasonsBuilder }),
    ),
  ),
  "relationship-calendar": lazyBuilder(() =>
    import("@/features/relationship-calendar/components/builder/relationship-calendar-builder").then(
      (m) => ({ default: m.RelationshipCalendarBuilder }),
    ),
  ),
};

/** True when this experience type can be edited inside the dashboard. */
export function hasEmbeddedBuilder(type: string): boolean {
  return type in BUILDERS;
}

/** Render the in-dashboard builder for `type`, or `null` if none is wired. */
export function renderBuilder(type: string): ReactNode {
  const Builder = BUILDERS[type];
  return Builder ? <Builder /> : null;
}

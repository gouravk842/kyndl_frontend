"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import type { BouquetConfig } from "@/features/chocolate-bouquet/config";
import type { SkyConfig } from "@/features/constellation/config";
import type { CountdownConfig } from "@/features/countdown/config";
import type { DeluluMeterConfig } from "@/features/delulu-meter/config";
import type { DeckConfig } from "@/features/desire-deck/config";
import type { MatcherContent } from "@/features/desire-matcher/config";
import type { DiceConfig } from "@/features/dice-of-desire/config";
import type { FlamesConfig } from "@/features/flames/config";
import type { FoldedNoteConfig } from "@/features/folded-note/config";
import type { LoveCalculatorConfig } from "@/features/love-calculator/config";
import type { CouponBook } from "@/features/love-coupons/config";
import type { LudoConfig } from "@/features/ludo/config";
import type { CityDoc } from "@/features/memory-city/lib/city-from-memories";
import type { JarConfig } from "@/features/memory-jar/config";
import type { LanternConfig } from "@/features/memory-lantern/config";
import type { MemoryPagesDoc } from "@/features/memory-pages/types";
import type { MirrorContent } from "@/features/mirror-match/config";
import type { WheelConfig } from "@/features/naughty-spins/config";
import type { OurPlacesDoc } from "@/features/our-places/types";
import type { RelationshipCalendarDoc } from "@/features/relationship-calendar/types";
import type { ScrapbookStory } from "@/features/scrapbook/types";
import type { SnakesConfig } from "@/features/snakes-and-lovers/config";
import type { PlaqueConfig } from "@/features/spotify-plaque/config";
import type { StringFrameConfig } from "@/features/string-frame/config";
import type { ThisOrThatConfig } from "@/features/this-or-that/config";
import type { TimeCapsuleConfig } from "@/features/time-capsule/config";
import type { TimelessTreasureConfig } from "@/features/timeless-treasure/config";
import type { TwentyFourReasonsContent } from "@/features/twenty-four-reasons/config";
import type { WhackAMoleConfig } from "@/features/whack-a-mole/config";
import type { CreationAsset } from "@/types/creation";

/**
 * The audience-facing renderer for each experience type. A published creation's
 * `content` + resolved `assets` (fileId → URL) are handed to the same component
 * the marketing/builder previews use, in read-only form. Keyed by the backend
 * `type` slug — the single place that maps a stored creation to its viewer.
 *
 * Loaded via `next/dynamic` so each heavy experience bundle is only fetched when
 * actually viewed.
 */
type PublicRenderer = (
  content: unknown,
  assets: Record<string, string>,
  /** The share token — only Moments (which answer back to the creator) use it. */
  token: string,
  /** `authorId → display name` map — Memory Pages uses it to attribute memories. */
  authors: Record<string, string>,
  creationId?: string,
) => ReactNode;

const MemoryJarExperience = dynamic(() =>
  import("@/features/memory-jar/components/memory-jar-experience").then(
    (m) => m.MemoryJarExperience,
  ),
);

const ConstellationExperience = dynamic(() =>
  import("@/features/constellation/components/constellation-experience").then(
    (m) => m.ConstellationExperience,
  ),
);

const MemoryCityExperience = dynamic(() =>
  import("@/features/memory-city/components/memory-city-experience").then(
    (m) => m.MemoryCityExperience,
  ),
);

const MemoryLanternExperience = dynamic(() =>
  import("@/features/memory-lantern/components/memory-lantern-experience").then(
    (m) => m.MemoryLanternExperience,
  ),
);

const ChocolateBouquetExperience = dynamic(() =>
  import("@/features/chocolate-bouquet/components/chocolate-bouquet-experience").then(
    (m) => m.ChocolateBouquetExperience,
  ),
);

const BookViewer = dynamic(() =>
  import("@/features/scrapbook/components/viewer/book-viewer").then(
    (m) => m.BookViewer,
  ),
);

const CountdownExperience = dynamic(() =>
  import("@/features/countdown/components/countdown-experience").then(
    (m) => m.CountdownExperience,
  ),
);

const LudoExperience = dynamic(() =>
  import("@/features/ludo/components/ludo-experience").then(
    (m) => m.LudoExperience,
  ),
);

const WhackAMoleExperience = dynamic(() =>
  import("@/features/whack-a-mole/components/whack-a-mole-experience").then(
    (m) => m.WhackAMoleExperience,
  ),
);

const FlamesExperience = dynamic(() =>
  import("@/features/flames/components/flames-experience").then(
    (m) => m.FlamesExperience,
  ),
);

const LoveCalculatorExperience = dynamic(() =>
  import("@/features/love-calculator/components/love-calculator-experience").then(
    (m) => m.LoveCalculatorExperience,
  ),
);

const FoldedNoteExperience = dynamic(() =>
  import("@/features/folded-note/components/folded-note-experience").then(
    (m) => m.FoldedNoteExperience,
  ),
);

const ThisOrThatExperience = dynamic(() =>
  import("@/features/this-or-that/components/this-or-that-experience").then(
    (m) => m.ThisOrThatExperience,
  ),
);

const DeluluMeterExperience = dynamic(() =>
  import("@/features/delulu-meter/components/delulu-meter-experience").then(
    (m) => m.DeluluMeterExperience,
  ),
);

const SpotifyPlaqueExperience = dynamic(() =>
  import("@/features/spotify-plaque/components/spotify-plaque-experience").then(
    (m) => m.SpotifyPlaqueExperience,
  ),
);

const StringFrameExperience = dynamic(() =>
  import("@/features/string-frame/components/string-frame-experience").then(
    (m) => m.StringFrameExperience,
  ),
);

const TimelessTreasureExperience = dynamic(() =>
  import("@/features/timeless-treasure/components/timeless-treasure-experience").then(
    (m) => m.TimelessTreasureExperience,
  ),
);

const TimeCapsuleExperience = dynamic(() =>
  import("@/features/time-capsule/components/time-capsule-experience").then(
    (m) => m.TimeCapsuleExperience,
  ),
);

const PublicReasonsViewer = dynamic(() =>
  import("@/features/twenty-four-reasons/components/public-reasons-viewer").then(
    (m) => m.PublicReasonsViewer,
  ),
);

const DesireDeckExperience = dynamic(() =>
  import("@/features/desire-deck/components/desire-deck-experience").then(
    (m) => m.DesireDeckExperience,
  ),
);

const MatcherExperience = dynamic(() =>
  import("@/features/desire-matcher/components/matcher-experience").then(
    (m) => m.MatcherExperience,
  ),
);

const PublicMirrorViewer = dynamic(() =>
  import("@/features/mirror-match/components/public-mirror-viewer").then(
    (m) => m.PublicMirrorViewer,
  ),
);

const CouponBookExperience = dynamic(() =>
  import("@/features/love-coupons/components/coupon-book-experience").then(
    (m) => m.CouponBookExperience,
  ),
);

const NaughtySpinsExperience = dynamic(() =>
  import("@/features/naughty-spins/components/naughty-spins-experience").then(
    (m) => m.NaughtySpinsExperience,
  ),
);

const AlbumViewer = dynamic(() =>
  import("@/features/memory-pages/components/viewer/album-viewer").then(
    (m) => m.AlbumViewer,
  ),
);

const OurPlacesPublicViewer = dynamic(() =>
  import("@/features/our-places/components/our-places-public-viewer").then(
    (m) => m.OurPlacesPublicViewer,
  ),
);

const RelationshipCalendarPublicViewer = dynamic(() =>
  import("@/features/relationship-calendar/components/relationship-calendar-public-viewer").then(
    (m) => m.RelationshipCalendarPublicViewer,
  ),
);

const DiceOfDesireExperience = dynamic(() =>
  import("@/features/dice-of-desire/components/dice-of-desire-experience").then(
    (m) => m.DiceOfDesireExperience,
  ),
);

const SnakesAndLoversExperience = dynamic(() =>
  import("@/features/snakes-and-lovers/components/snakes-and-lovers-experience").then(
    (m) => m.SnakesAndLoversExperience,
  ),
);

// Moments (proposal, date-ask) share one engine and answer back to the creator,
// so they take the share `token`.
const MomentViewer = dynamic(() =>
  import("@/features/moment/components/moment-viewer").then(
    (m) => m.MomentViewer,
  ),
);

const PUBLIC_VIEWERS: Record<string, PublicRenderer> = {
  // The public jar page owns the music via a header autoplay toggle
  // (see MemoryJarPublicView), so the experience's own music button is off here.
  "memory-jar": (content, assets) => (
    <MemoryJarExperience
      config={content as JarConfig}
      assets={assets}
      playMusic={false}
    />
  ),
  // A star's `imageUrl` is a direct path, but a jigsaw gate's uploaded photo is
  // a media ref resolved through `assets` (fileId → URL).
  constellation: (content, assets, token, _authors, creationId) => (
    <ConstellationExperience
      config={content as SkyConfig}
      assets={assets}
      progressKey={token}
      shareToken={token}
      creationId={creationId}
    />
  ),
  "memory-city": (content, assets, token) => (
    <MemoryCityExperience
      doc={content as CityDoc}
      assets={assets}
      progressKey={token}
    />
  ),
  // Facet photos resolve through the creation's `assets` (fileId → URL).
  "memory-lantern": (content, assets) => (
    <MemoryLanternExperience
      config={content as LanternConfig}
      assets={assets}
    />
  ),
  // Chocolates carry their own `imageUrl`/`audioUrl`, so no assets indirection.
  "chocolate-bouquet": (content) => (
    <ChocolateBouquetExperience config={content as BouquetConfig} />
  ),
  scrapbook: (content) => <BookViewer story={content as ScrapbookStory} />,
  countdown: (content, assets) => (
    <CountdownExperience config={content as CountdownConfig} assets={assets} />
  ),
  // A saved Ludo opens straight into the authored game (players + couple deck).
  ludo: (content) => <LudoExperience config={content as LudoConfig} />,
  // Face photo resolves through the creation's `assets` (fileId → URL).
  "whack-a-mole": (content, assets) => (
    <WhackAMoleExperience
      config={content as WhackAMoleConfig}
      assets={assets}
    />
  ),
  flames: (content) => <FlamesExperience config={content as FlamesConfig} />,
  "love-calculator": (content) => (
    <LoveCalculatorExperience config={content as LoveCalculatorConfig} />
  ),
  "folded-note": (content) => (
    <FoldedNoteExperience config={content as FoldedNoteConfig} />
  ),
  "this-or-that": (content) => (
    <ThisOrThatExperience config={content as ThisOrThatConfig} />
  ),
  "delulu-meter": (content) => (
    <DeluluMeterExperience config={content as DeluluMeterConfig} />
  ),
  "spotify-plaque": (content, assets) => (
    <SpotifyPlaqueExperience config={content as PlaqueConfig} assets={assets} />
  ),
  "string-frame": (content, assets) => (
    <StringFrameExperience
      config={content as StringFrameConfig}
      assets={assets}
    />
  ),
  "timeless-treasure": (content, assets) => (
    <TimelessTreasureExperience
      config={content as TimelessTreasureConfig}
      assets={assets}
    />
  ),
  // Sealed until its unlock date, then opens to the letter; photos/music resolve
  // through the creation's `assets` (fileId → URL).
  "time-capsule": (content, assets) => (
    <TimeCapsuleExperience
      config={content as TimeCapsuleConfig}
      assets={assets}
    />
  ),
  // Hourly sealed reasons; share token scopes localStorage “newly opened” sparkle.
  "twenty-four-reasons": (content, assets, token) => (
    <PublicReasonsViewer
      content={content as TwentyFourReasonsContent}
      assets={assets}
      token={token}
    />
  ),
  // Adults-only (Red Zone); the experience renders its own 18+ gate on view.
  "desire-deck": (content, assets) => (
    <DesireDeckExperience config={content as DeckConfig} assets={assets} />
  ),
  // Adults-only (Red Zone) spin-the-wheel; renders its own 18+ gate on view.
  "naughty-spins": (content) => (
    <NaughtySpinsExperience config={content as WheelConfig} />
  ),
  // Two-sided matcher — takes the share token so the partner's answers can be
  // submitted back and the mutual reveal returned.
  "desire-matcher": (content, assets, token) => (
    <MatcherExperience
      content={content as MatcherContent}
      token={token}
      assets={assets}
    />
  ),
  "mirror-match": (content, _assets, token) => (
    <PublicMirrorViewer content={content as MirrorContent} token={token} />
  ),
  // Coupon booklet — takes the token so a redemption pings the owner.
  "love-coupons": (content, assets, token) => (
    <CouponBookExperience
      content={content as CouponBook}
      token={token}
      assets={assets}
    />
  ),
  // The book floats on the keepsake background (AlbumViewer is frameless by
  // default) instead of its own caramel desk — the page owns the backdrop.
  "memory-pages": (content, assets, _token, authors) => (
    <AlbumViewer
      doc={content as MemoryPagesDoc}
      assets={assets}
      authors={authors}
    />
  ),
  // The saved map doc; place photos resolve through the creation's `assets`.
  "our-places": (content, assets) => (
    <OurPlacesPublicViewer content={content as OurPlacesDoc} assets={assets} />
  ),
  "relationship-calendar": (content, assets) => (
    <RelationshipCalendarPublicViewer
      content={content as RelationshipCalendarDoc}
      assets={assets}
    />
  ),
  // Adults-only (Red Zone); the experience renders its own 18+ gate on view.
  "dice-of-desire": (content, assets) => (
    <DiceOfDesireExperience config={content as DiceConfig} assets={assets} />
  ),
  // Adults-only (Red Zone); the experience renders its own 18+ gate on view.
  "snakes-and-lovers": (content, assets) => (
    <SnakesAndLoversExperience
      config={content as SnakesConfig}
      assets={assets}
    />
  ),
  proposal: (content, assets, token) => (
    <MomentViewer
      content={content}
      assets={assets}
      token={token}
      experienceType="proposal"
    />
  ),
  "date-ask": (content, assets, token) => (
    <MomentViewer
      content={content}
      assets={assets}
      token={token}
      experienceType="date-ask"
    />
  ),
};

/** True when this experience type has an audience-facing public viewer. */
export function hasPublicViewer(type: string): boolean {
  return type in PUBLIC_VIEWERS;
}

/** Resolve `assets` (fileId → CreationAsset) down to plain fileId → URL. */
export function assetUrls(
  assets: Record<string, CreationAsset> | undefined,
): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const [fileId, asset] of Object.entries(assets ?? {})) {
    urls[fileId] = asset.url;
  }
  return urls;
}

/** Render the public experience for `type`, or `null` if none is wired yet. */
export function renderPublicExperience(
  type: string,
  content: unknown,
  assets: Record<string, string>,
  token: string,
  authors: Record<string, string> = {},
  creationId?: string,
): ReactNode {
  return (
    PUBLIC_VIEWERS[type]?.(content, assets, token, authors, creationId) ?? null
  );
}

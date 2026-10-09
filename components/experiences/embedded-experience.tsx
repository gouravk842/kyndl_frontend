"use client";

import {
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { ChocolateBouquetExperience } from "@/features/chocolate-bouquet/components/chocolate-bouquet-experience";
import { ConstellationExperience } from "@/features/constellation/components/constellation-experience";
import { CountdownExperience } from "@/features/countdown/components/countdown-experience";
import { DeluluMeterExperience } from "@/features/delulu-meter/components/delulu-meter-experience";
import { DesireDeckExperience } from "@/features/desire-deck/components/desire-deck-experience";
import { MatcherExperience } from "@/features/desire-matcher/components/matcher-experience";
import { DiceOfDesireExperience } from "@/features/dice-of-desire/components/dice-of-desire-experience";
import { FlamesExperience } from "@/features/flames/components/flames-experience";
import { FoldedNoteExperience } from "@/features/folded-note/components/folded-note-experience";
import { LoveCalculatorExperience } from "@/features/love-calculator/components/love-calculator-experience";
import { CouponBookExperience } from "@/features/love-coupons/components/coupon-book-experience";
import { LudoExperience } from "@/features/ludo/components/ludo-experience";
import { MemoryCityExperience } from "@/features/memory-city/components/memory-city-experience";
import { MemoryJarExperience } from "@/features/memory-jar/components/memory-jar-experience";
import { MemoryLanternExperience } from "@/features/memory-lantern/components/memory-lantern-experience";
import { MemoryPagesExperience } from "@/features/memory-pages/components/memory-pages-experience";
import {
  previewAlbum,
  previewAssets,
} from "@/features/memory-pages/data/marketing-preview";
import { MirrorExperience } from "@/features/mirror-match/components/mirror-experience";
import { MomentPlayer } from "@/features/moment/components/moment-player";
import { SAMPLE_DATE_ASK, SAMPLE_PROPOSAL } from "@/features/moment/config";
import { NaughtySpinsExperience } from "@/features/naughty-spins/components/naughty-spins-experience";
import { OurPlacesExperience } from "@/features/our-places/components/our-places-experience";
import { RelationshipCalendarExperience } from "@/features/relationship-calendar/components/relationship-calendar-experience";
import { ScrapbookExperience } from "@/features/scrapbook/components/scrapbook-experience";
import { SnakesAndLoversExperience } from "@/features/snakes-and-lovers/components/snakes-and-lovers-experience";
import { SpotifyPlaqueExperience } from "@/features/spotify-plaque/components/spotify-plaque-experience";
import { StringFrameExperience } from "@/features/string-frame/components/string-frame-experience";
import { ThisOrThatExperience } from "@/features/this-or-that/components/this-or-that-experience";
import { TimeCapsuleExperience } from "@/features/time-capsule/components/time-capsule-experience";
import { TimelessTreasureExperience } from "@/features/timeless-treasure/components/timeless-treasure-experience";
import { ReasonsExperience } from "@/features/twenty-four-reasons/components/reasons-experience";
import { getDemoContent } from "@/features/twenty-four-reasons/config";
import { WhackAMoleExperience } from "@/features/whack-a-mole/components/whack-a-mole-experience";
import { cn } from "@/lib/utils";

/** Product-page frame vs fullscreen public-style demo (`/preview/[slug]`). */
export type EmbedVariant = "embed" | "public-demo";

const EmbedVariantContext = createContext<EmbedVariant>("embed");

function useEmbedVariant() {
  return useContext(EmbedVariantContext);
}

/** Compact fill for scene experiences that accept `className`. */
const FIT = "h-full min-h-0 py-4 px-3";
const FIT_FULL = "h-full min-h-0";

/** Canvas / map experiences that should paint edge-to-edge in the frame. */
function Fill({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0">{children}</div>;
}

/**
 * Shrink a full-size experience into the product-page frame without clipping.
 * In `public-demo` mode the experience fills the viewport at natural size.
 */
function Scaled({
  children,
  scale = 0.78,
}: {
  children: ReactNode;
  scale?: number;
}) {
  const variant = useEmbedVariant();
  if (variant === "public-demo") {
    return <div className="absolute inset-0 overflow-auto">{children}</div>;
  }
  const pct = `${(100 / scale).toFixed(2)}%`;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          width: pct,
          height: pct,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Scrollable / centered host for content taller than the frame. */
function Stage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center overflow-auto overscroll-contain p-3 sm:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MemoryPagesEmbed() {
  const variant = useEmbedVariant();
  return (
    <MemoryPagesExperience
      doc={previewAlbum}
      assets={previewAssets}
      autoPlay
      fit={variant === "public-demo" ? "viewport" : "container"}
    />
  );
}

function CountdownEmbed() {
  const variant = useEmbedVariant();
  return (
    <Fill>
      <CountdownExperience
        className={variant === "public-demo" ? FIT_FULL : FIT}
        playMusic={variant === "public-demo"}
      />
    </Fill>
  );
}

function TimeCapsuleEmbed() {
  return (
    <Scaled scale={0.8}>
      <TimeCapsuleExperience className="h-full min-h-0" />
    </Scaled>
  );
}

function SpotifyPlaqueEmbed() {
  const variant = useEmbedVariant();
  return (
    <Scaled scale={0.72}>
      <SpotifyPlaqueExperience
        className={
          variant === "public-demo" ? "h-full min-h-0" : "h-full min-h-0 py-6"
        }
        playMusic={variant === "public-demo"}
      />
    </Scaled>
  );
}

function StringFrameEmbed() {
  const variant = useEmbedVariant();
  return (
    <Scaled scale={0.72}>
      <StringFrameExperience
        className={
          variant === "public-demo" ? "h-full min-h-0" : "h-full min-h-0 py-6"
        }
        playMusic={variant === "public-demo"}
      />
    </Scaled>
  );
}

function TimelessTreasureEmbed() {
  const variant = useEmbedVariant();
  return (
    <Scaled scale={0.75}>
      <TimelessTreasureExperience
        className="h-full min-h-0"
        playMusic={variant === "public-demo"}
      />
    </Scaled>
  );
}

function ReasonsEmbed() {
  return (
    <Stage>
      <ReasonsExperience content={getDemoContent()} seenScope="demo" bare />
    </Stage>
  );
}

function ProposalEmbed() {
  const variant = useEmbedVariant();
  return (
    <Fill>
      <MomentPlayer
        doc={SAMPLE_PROPOSAL}
        className={variant === "public-demo" ? FIT_FULL : FIT}
      />
    </Fill>
  );
}

function DateAskEmbed() {
  const variant = useEmbedVariant();
  return (
    <Fill>
      <MomentPlayer
        doc={SAMPLE_DATE_ASK}
        className={variant === "public-demo" ? FIT_FULL : FIT}
      />
    </Fill>
  );
}

function MemoryCityEmbed() {
  return (
    <Fill>
      <MemoryCityExperience preview />
    </Fill>
  );
}

function ConstellationEmbed() {
  return (
    <Fill>
      <ConstellationExperience preview />
    </Fill>
  );
}

function ChocolateBouquetEmbed() {
  return (
    <Fill>
      <ChocolateBouquetExperience preview />
    </Fill>
  );
}

function MemoryLanternEmbed() {
  return (
    <Fill>
      <MemoryLanternExperience />
    </Fill>
  );
}

function OurPlacesEmbed() {
  return (
    <Fill>
      <OurPlacesExperience />
    </Fill>
  );
}

function RelationshipCalendarEmbed() {
  return (
    <Fill>
      <div className="h-full w-full overflow-auto bg-[#ead9c4]">
        <RelationshipCalendarExperience fit />
      </div>
    </Fill>
  );
}

function MemoryJarEmbed() {
  const variant = useEmbedVariant();
  return (
    <Scaled scale={0.82}>
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-[#fdf3e7]",
          variant === "public-demo" ? "p-8" : "p-6",
        )}
      >
        <MemoryJarExperience playMusic={variant === "public-demo"} />
      </div>
    </Scaled>
  );
}

function LudoEmbed() {
  return (
    <Scaled scale={0.78}>
      <div className="h-full w-full overflow-auto bg-[#fffaf4] p-4">
        <LudoExperience />
      </div>
    </Scaled>
  );
}

function WhackAMoleEmbed() {
  return (
    <Scaled scale={0.72}>
      <div className="h-full w-full overflow-hidden bg-[#fdf3ec]">
        <WhackAMoleExperience className="h-full min-h-0" />
      </div>
    </Scaled>
  );
}

function FlamesEmbed() {
  return (
    <Scaled scale={0.72}>
      <div className="h-full w-full overflow-auto bg-[#fdf3ec]">
        <FlamesExperience className="min-h-full" />
      </div>
    </Scaled>
  );
}

function LoveCalculatorEmbed() {
  return (
    <Scaled scale={0.72}>
      <div className="h-full w-full overflow-auto bg-[#fff6f0]">
        <LoveCalculatorExperience className="min-h-full" />
      </div>
    </Scaled>
  );
}

function FoldedNoteEmbed() {
  return (
    <Scaled scale={0.72}>
      <div className="h-full w-full overflow-auto bg-[#f7efe4]">
        <FoldedNoteExperience className="min-h-full" />
      </div>
    </Scaled>
  );
}

function ThisOrThatEmbed() {
  return (
    <Scaled scale={0.72}>
      <div className="h-full w-full overflow-auto bg-[#fdf3ec]">
        <ThisOrThatExperience className="min-h-full" />
      </div>
    </Scaled>
  );
}

function DeluluMeterEmbed() {
  return (
    <Scaled scale={0.72}>
      <div className="h-full w-full overflow-auto bg-[#1a0f14]">
        <DeluluMeterExperience className="min-h-full" />
      </div>
    </Scaled>
  );
}

function MirrorEmbed() {
  return (
    <Scaled scale={0.85}>
      <div className="h-full w-full">
        <MirrorExperience bare />
      </div>
    </Scaled>
  );
}

/**
 * Red Zone demos: product-page embeds skip the age gate (shelf already
 * consented). Public-demo mode keeps the gate so it matches a published `/v/`.
 */
function DesireDeckEmbed() {
  const skipGate = useEmbedVariant() === "embed";
  return (
    <Scaled scale={0.82}>
      <div className="h-full w-full overflow-y-auto bg-[#0d040a]">
        <div className="flex min-h-full w-full items-center justify-center p-4">
          <DesireDeckExperience skipGate={skipGate} />
        </div>
      </div>
    </Scaled>
  );
}

function DesireMatcherEmbed() {
  const skipGate = useEmbedVariant() === "embed";
  return (
    <Scaled scale={0.85}>
      <div className="flex h-full w-full items-center justify-center bg-[#0d040a] p-4">
        <MatcherExperience skipGate={skipGate} />
      </div>
    </Scaled>
  );
}

function DiceOfDesireEmbed() {
  const skipGate = useEmbedVariant() === "embed";
  return (
    <Scaled scale={0.8}>
      <div className="flex h-full w-full items-center justify-center bg-[#0d040a] p-4">
        <DiceOfDesireExperience skipGate={skipGate} />
      </div>
    </Scaled>
  );
}

function SnakesAndLoversEmbed() {
  const skipGate = useEmbedVariant() === "embed";
  return (
    <Scaled scale={0.65}>
      <div className="h-full w-full overflow-auto bg-[#0d040a] p-4">
        <SnakesAndLoversExperience skipGate={skipGate} />
      </div>
    </Scaled>
  );
}

function LoveCouponsEmbed() {
  const skipGate = useEmbedVariant() === "embed";
  return (
    <Scaled scale={0.82}>
      <div className="flex h-full w-full items-center justify-center bg-[#0d040a] p-4">
        <CouponBookExperience skipGate={skipGate} />
      </div>
    </Scaled>
  );
}

function NaughtySpinsEmbed() {
  const skipGate = useEmbedVariant() === "embed";
  return (
    <Scaled scale={0.72}>
      <div className="flex h-full w-full items-start justify-center overflow-auto bg-[#0d040a] p-4">
        <NaughtySpinsExperience skipGate={skipGate} />
      </div>
    </Scaled>
  );
}

/**
 * Live experiences that render inline on their product page.
 *
 * - `embedded` types (scrapbook) replace the hero with the full experience.
 * - `inlineEmbed` types play inside the right-hand hero card.
 * - `public-demo` variant fills `/preview/[slug]` at natural size (publish look).
 */
const embeds: Record<string, ComponentType> = {
  scrapbook: ScrapbookExperience,
  "memory-pages": MemoryPagesEmbed,
  "our-places": OurPlacesEmbed,
  "relationship-calendar": RelationshipCalendarEmbed,
  "memory-jar": MemoryJarEmbed,
  "memory-city": MemoryCityEmbed,
  constellation: ConstellationEmbed,
  "chocolate-bouquet": ChocolateBouquetEmbed,
  "memory-lantern": MemoryLanternEmbed,
  countdown: CountdownEmbed,
  "time-capsule": TimeCapsuleEmbed,
  "twenty-four-reasons": ReasonsEmbed,
  "spotify-plaque": SpotifyPlaqueEmbed,
  "string-frame": StringFrameEmbed,
  "timeless-treasure": TimelessTreasureEmbed,
  ludo: LudoEmbed,
  "whack-a-mole": WhackAMoleEmbed,
  flames: FlamesEmbed,
  "love-calculator": LoveCalculatorEmbed,
  "folded-note": FoldedNoteEmbed,
  "this-or-that": ThisOrThatEmbed,
  "delulu-meter": DeluluMeterEmbed,
  proposal: ProposalEmbed,
  "date-ask": DateAskEmbed,
  "mirror-match": MirrorEmbed,
  "desire-deck": DesireDeckEmbed,
  "desire-matcher": DesireMatcherEmbed,
  "dice-of-desire": DiceOfDesireEmbed,
  "snakes-and-lovers": SnakesAndLoversEmbed,
  "love-coupons": LoveCouponsEmbed,
  "naughty-spins": NaughtySpinsEmbed,
};

export function EmbeddedExperience({
  slug,
  variant = "embed",
}: {
  slug: string;
  variant?: EmbedVariant;
}) {
  const Embed = embeds[slug];
  if (!Embed) return null;
  return (
    <EmbedVariantContext.Provider value={variant}>
      <div
        className={cn(
          "relative overflow-hidden",
          variant === "public-demo" ? "absolute inset-0" : "h-full w-full",
        )}
      >
        <Embed />
      </div>
    </EmbedVariantContext.Provider>
  );
}

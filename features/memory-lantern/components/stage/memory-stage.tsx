"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { DEFAULT_MATERIAL, type LanternConfig, type Pane } from "../../config";
import { type StagePhase, useStageShow } from "../../hooks/use-stage-show";
import { computeAmbience } from "../../lib/ambience";
import { Curtains } from "./curtains";
import { HeroMemory } from "./hero-memory";
import { Podium } from "./podium";
import { ScrollNote } from "./scroll-note";
import { Spotlight } from "./spotlight";
import { TitleCard } from "./title-card";

const FALLBACK_GLOW = "#f0c48a";

/**
 * The opening night. One full-viewport stage: curtains, a searching light,
 * then a single memory lowered onto the podium. The same component plays in
 * the public viewer, the catalog embed, and the builder.
 */
export function MemoryStage({
  config,
  assets,
  reducedMotion,
  ceremony,
}: {
  config: LanternConfig;
  assets?: Record<string, string>;
  reducedMotion: boolean;
  ceremony: boolean;
}) {
  const show = useStageShow({ config, reducedMotion, ceremony });
  const ambience = useAmbience(config);
  const rootRef = useRef<HTMLDivElement>(null);
  const swiped = useRef(false);
  const startX = useRef<number | null>(null);

  const { panes } = config;
  const count = panes.length;
  const core = config.material?.coreColor || DEFAULT_MATERIAL.coreColor;
  const parted = show.phase !== "closed";
  const showHero =
    (show.phase === "onstage" || show.phase === "finale") && count > 0;
  const active = panes[show.index] ?? null;
  const glowPane = panes[show.glowIndex] ?? active;
  const stageColor =
    show.phase === "search" ||
    show.phase === "dedication" ||
    show.phase === "closed"
      ? core
      : glowOf(glowPane, core);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show.advance(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      show.advance(-1);
    }
  };

  if (count === 0) {
    return (
      <StageFrame
        color={core}
        intensity={ambience.intensity}
        flare={ambience.flare}
        phase="onstage"
        reducedMotion={reducedMotion}
      >
        <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-[12%]">
          <Podium glow={core} bulbs={[]} reducedMotion={reducedMotion} />
          <p className="font-serif relative z-20 mt-3 max-w-xs text-center text-base text-[#f6efdd]">
            Add a moment to open the evening.
          </p>
        </div>
      </StageFrame>
    );
  }

  const heroUrl = active?.fileId ? (assets?.[active.fileId] ?? null) : null;
  const litIndex = show.phase === "blackout" ? show.glowIndex : show.index;
  const bulbs = panes.map((pane, i) => ({
    id: pane.id,
    state: bulbState(i, litIndex, show.phase, !!show.seen[pane.id]),
  }));
  const canStep =
    parted && show.phase !== "search" && show.phase !== "dedication";
  const titlesResting =
    show.phase === "onstage" ||
    show.phase === "finale" ||
    show.phase === "blackout";
  const note = active?.description?.trim() ?? "";

  return (
    <StageFrame
      rootRef={rootRef}
      color={stageColor}
      intensity={ambience.intensity}
      flare={ambience.flare}
      phase={show.phase}
      reducedMotion={reducedMotion}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        show.setHolding(true);
        startX.current = e.clientX;
        rootRef.current?.focus();
      }}
      onPointerUp={(e) => {
        show.setHolding(false);
        if (startX.current == null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) < 48) return;
        swiped.current = true;
        show.advance(dx < 0 ? 1 : -1);
        window.setTimeout(() => {
          swiped.current = false;
        }, 0);
      }}
      onPointerCancel={() => show.setHolding(false)}
      onClick={() => {
        if (swiped.current) return;
        if (show.phase === "search" || show.phase === "dedication") {
          show.advance(1);
        }
      }}
    >
      <div className="relative z-10 flex h-full min-h-0 w-full flex-col items-center px-14 pb-[max(0.45rem,env(safe-area-inset-bottom))]">
        <header className="pointer-events-none w-full shrink-0 px-2 pt-[max(0.85rem,env(safe-area-inset-top))] pb-1 text-center">
          <motion.div
            initial={false}
            animate={{
              opacity: titlesResting ? 1 : 0,
              y: titlesResting ? 0 : -8,
            }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
          >
            {config.recipientName.trim() ? (
              <p
                className={`text-[#f0d7a8] ${
                  config.recipientName.trim().length > 28
                    ? "mx-auto line-clamp-2 max-w-sm font-serif text-sm leading-snug"
                    : "font-hand text-lg"
                }`}
              >
                for {config.recipientName.trim()}
              </p>
            ) : null}
            <h1 className={titleClass(config.title)}>{config.title}</h1>
            <motion.span
              aria-hidden
              className="mx-auto mt-1.5 block h-px w-16 origin-center bg-gradient-to-r from-transparent via-[#e8c872] to-transparent"
              initial={false}
              animate={{
                scaleX: titlesResting ? 1 : 0,
                opacity: titlesResting ? 1 : 0,
              }}
              transition={{
                duration: reducedMotion ? 0.01 : 0.7,
                delay: parted ? 0.15 : 0,
              }}
            />
            {config.subtitle ? (
              <p className="mx-auto mt-1 line-clamp-2 max-w-sm font-serif text-sm leading-snug text-[#e7d8c4] [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">
                {config.subtitle}
              </p>
            ) : (
              <p className="mt-1 h-5" aria-hidden />
            )}
          </motion.div>
        </header>

        <div className="grid min-h-0 w-full flex-1 basis-0 grid-cols-[minmax(0,1fr)_minmax(0,min(52cqw,380px))_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_4.5rem_auto] overflow-hidden [container-type:size]">
          <AnimatePresence mode="wait">
            {showHero && active ? (
              <motion.div
                key={active.id}
                className="col-span-3 row-span-3 grid h-full grid-cols-subgrid grid-rows-subgrid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
              >
                <div className="col-start-2 row-start-2 flex h-full items-end justify-center overflow-hidden text-center">
                  <ImageTitle caption={active.caption} date={active.date} />
                </div>
                <div className="col-start-2 row-start-3 flex w-full items-end justify-center">
                  <HeroMemory
                    url={heroUrl}
                    glow={glowOf(active, core)}
                    caption={active.caption}
                    reducedMotion={reducedMotion}
                  />
                </div>
                <aside className="col-start-3 row-start-3 flex min-h-0 items-center self-stretch overflow-hidden pr-1 pl-3">
                  {note ? (
                    <ScrollNote text={note} reducedMotion={reducedMotion} />
                  ) : null}
                </aside>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {show.phase === "dedication" ? (
            <TitleCard
              key="title-card"
              recipient={config.recipientName}
              title={config.title}
              subtitle={config.subtitle}
              reducedMotion={reducedMotion}
            />
          ) : null}
        </AnimatePresence>

        <div className="-mt-7 shrink-0">
          <Podium
            glow={stageColor}
            bulbs={bulbs}
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="flex h-[4.75rem] w-full max-w-md shrink-0 items-start justify-center overflow-y-auto overscroll-contain px-1 text-center [scrollbar-color:rgba(232,200,114,0.45)_transparent] [scrollbar-width:thin]">
          <Plaque
            phase={show.phase}
            finale={config.finale}
            onEncore={() => {
              show.encore();
              rootRef.current?.focus();
            }}
          />
        </div>
      </div>

      <Curtains parted={parted} reducedMotion={reducedMotion} />

      {show.phase === "closed" ? (
        <button
          type="button"
          onClick={() => {
            show.begin();
            rootRef.current?.focus();
          }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-8 text-center"
        >
          <span
            className={`text-[#f0d7a8] ${
              config.recipientName.trim().length > 28
                ? "line-clamp-2 max-w-sm font-serif text-sm leading-snug"
                : "font-hand text-xl"
            }`}
          >
            {config.recipientName.trim()
              ? `for ${config.recipientName.trim()}`
              : "a private opening"}
          </span>
          <span className={titleClass(config.title)}>{config.title}</span>
          {config.subtitle ? (
            <span className="line-clamp-2 max-w-sm font-serif text-sm leading-snug text-[#e7d8c4]">
              {config.subtitle}
            </span>
          ) : null}
          <span className="mt-2 rounded-full border border-[#e7c27a]/80 bg-black/25 px-5 py-2 font-serif text-sm tracking-wide text-[#f6efdd]">
            Part the curtains
          </span>
        </button>
      ) : null}

      {canStep ? (
        <>
          <StepButton
            label="Previous moment"
            side="left"
            hidden={show.phase === "finale" ? count < 2 : show.index === 0}
            onClick={() => {
              if (swiped.current) {
                swiped.current = false;
                return;
              }
              show.advance(-1);
            }}
          />
          <StepButton
            label="Next moment"
            side="right"
            hidden={show.phase === "finale"}
            onClick={() => {
              if (swiped.current) {
                swiped.current = false;
                return;
              }
              show.advance(1);
            }}
          />
        </>
      ) : null}

      {titlesResting && show.phase !== "finale" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            show.togglePlay();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={show.playing ? "Pause slideshow" : "Play slideshow"}
          className="absolute right-4 bottom-[max(0.85rem,env(safe-area-inset-bottom))] z-40 grid size-11 place-items-center rounded-full border border-white/35 bg-white/12 text-[#f6efdd] shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md hover:bg-white/20"
        >
          {show.playing ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 translate-x-px" />
          )}
        </button>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {liveLine(show.phase, show.index, count, active, config)}
      </p>
    </StageFrame>
  );
}

function StageFrame({
  rootRef,
  color,
  intensity,
  flare,
  phase,
  reducedMotion,
  children,
  onKeyDown,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onClick,
}: {
  rootRef?: RefObject<HTMLDivElement | null>;
  color: string;
  intensity: number;
  flare: boolean;
  phase: StagePhase;
  reducedMotion: boolean;
  children: ReactNode;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative h-full w-full touch-none overflow-hidden bg-[#14081c] select-none outline-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
    >
      <Spotlight
        phase={phase}
        color={color}
        intensity={intensity}
        flare={flare}
        reducedMotion={reducedMotion}
      />
      {children}
    </div>
  );
}

function StepButton({
  label,
  side,
  hidden,
  onClick,
}: {
  label: string;
  side: "left" | "right";
  hidden: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 z-40 -translate-y-1/2 ${
        side === "left" ? "left-3 sm:left-5" : "right-3 sm:right-5"
      } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <span className="grid size-11 place-items-center rounded-full border border-white/30 bg-white/10 text-[#f6efdd] shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <Icon className="size-5" />
      </span>
    </button>
  );
}

function Plaque({
  phase,
  finale,
  onEncore,
}: {
  phase: StagePhase;
  finale?: LanternConfig["finale"];
  onEncore: () => void;
}) {
  if (phase !== "finale") return null;

  const finaleBody = finale?.body.trim() ?? "";
  const finaleHeading = finale?.heading.trim() ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center"
    >
      {finaleHeading ? (
        <p className="font-serif text-lg leading-snug break-words text-[#f6efdd] [text-shadow:0_1px_14px_rgba(0,0,0,0.9)]">
          {finaleHeading}
        </p>
      ) : null}
      {finaleBody ? (
        <p className="font-serif mt-1 text-sm leading-relaxed break-words whitespace-pre-wrap text-[#e7d8c4] [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
          {finaleBody}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onEncore}
        className="mt-2 shrink-0 rounded-full border border-[#e7c27a]/70 px-4 py-1 font-serif text-sm tracking-wide text-[#f6efdd] hover:bg-white/10"
      >
        Encore
      </button>
    </motion.div>
  );
}

function ImageTitle({ caption, date }: { caption: string; date: string }) {
  const title = caption.trim();
  const when = date.trim();
  const long = title.length > 42;
  return (
    <div className="flex max-h-full w-full flex-col items-center justify-end overflow-hidden px-1 text-center">
      {title ? (
        <p
          className={`line-clamp-2 font-serif break-words text-[#f8f1e4] [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] ${
            long ? "text-sm leading-snug" : "text-base leading-tight"
          }`}
        >
          {title}
        </p>
      ) : null}
      {when ? <DateLine date={when} /> : null}
    </div>
  );
}

function titleClass(title: string): string {
  const long = title.trim().length > 36;
  return long
    ? "mx-auto line-clamp-3 max-w-lg text-balance font-serif text-lg leading-snug text-[#f6efdd] sm:text-xl [text-shadow:0_2px_18px_rgba(0,0,0,0.75)]"
    : "mx-auto line-clamp-2 max-w-lg text-balance font-serif text-2xl tracking-wide text-[#f6efdd] sm:text-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.75)]";
}

function DateLine({ date }: { date: string }) {
  const long = date.trim().length > 22;
  return (
    <p
      className={
        long
          ? "mt-1 text-xs leading-snug break-words text-[#f0d7a8]"
          : "mt-0.5 text-[10px] font-medium tracking-[0.22em] text-[#f0d7a8] uppercase"
      }
    >
      {date}
    </p>
  );
}

function bulbState(
  i: number,
  index: number,
  phase: StagePhase,
  seen: boolean,
): "dark" | "warm" | "burn" {
  const showing =
    phase === "onstage" || phase === "finale" || phase === "blackout";
  if (showing && i === index) return "burn";
  if (seen) return "warm";
  return "dark";
}

function glowOf(pane: Pane | null, core: string): string {
  const glow = pane?.glowColor?.trim();
  return glow || core || FALLBACK_GLOW;
}

function liveLine(
  phase: StagePhase,
  index: number,
  count: number,
  pane: Pane | null,
  config: LanternConfig,
): string {
  if (phase === "closed") return `${config.title}. Part the curtains.`;
  if (phase === "search") return "The light is searching the stage.";
  if (phase === "dedication") {
    return [config.title, config.subtitle].filter(Boolean).join(". ");
  }
  if (phase === "finale") {
    return config.finale?.heading || "The evening is complete.";
  }
  if (!pane) return "";
  return `Moment ${index + 1} of ${count}. ${pane.caption} ${pane.date}`.trim();
}

/** Clock and anniversary are read after mount so the server paint stays neutral. */
function useAmbience(config: LanternConfig) {
  const [ambience, setAmbience] = useState({ intensity: 1, flare: false });
  useEffect(() => {
    // The clock is only available in the browser; reading it during render
    // would disagree with the server's first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmbience(computeAmbience(config.ambience));
  }, [config.ambience]);
  return ambience;
}

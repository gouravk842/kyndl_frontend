"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Flame, Hand, Lock, RotateCcw, Shuffle } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { CatalogImage } from "@/features/activity-bank/components/catalog-image";
import { applyDesireDeck } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import {
  DECK_CONFIG,
  type DeckCard,
  type DeckConfig,
  type Heat,
  HEAT_META,
  HEAT_ORDER,
} from "@/features/desire-deck/config";

import { Flames } from "./flames";

/**
 * The interactive Desire Deck. Reads its content from
 * {@link DesireDeckExperienceProps.config}, defaulting to the bundled sample so
 * the marketing page renders without wiring; the builder passes its live draft
 * here for an in-place preview, and the public viewer passes a published deck.
 *
 * Acts: an 18+ consent gate → a face-down deck you can riffle-shuffle → cards
 * that flip up off the top one at a time (swipe one away to draw the next),
 * optionally filtered by heat, until the chosen pile runs out.
 */
type DesireDeckExperienceProps = {
  config?: DeckConfig;
  /** Skip the 18+ gate (used inside the authenticated builder preview). */
  skipGate?: boolean;
  /** fileId → URL for catalog images copied onto cards. */
  assets?: Record<string, string>;
};

type HeatFilter = Heat | "all";

/** How many face-down cards to draw in the visible stack, for depth. */
const STACK_DEPTH = 6;

export function DesireDeckExperience(props: DesireDeckExperienceProps) {
  return (
    <DemoGate
      authored={props.config}
      fallback={DECK_CONFIG}
      includeAdult
      apply={applyDesireDeck}
    >
      {(config) => <DesireDeckPlay {...props} config={config} />}
    </DemoGate>
  );
}

function DesireDeckPlay({
  config,
  skipGate = false,
  assets,
}: DesireDeckExperienceProps & { config: DeckConfig }) {
  const reduceMotion = useReducedMotion();

  const [entered, setEntered] = useState(skipGate);
  const [filter, setFilter] = useState<HeatFilter>("all");
  const [drawn, setDrawn] = useState(0);
  const [started, setStarted] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  // Which way the current card flies off when dismissed (set on swipe/draw).
  const [exitDir, setExitDir] = useState(1);
  const shuffleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The deck for the current heat filter, in order.
  const pool = useMemo(
    () => config.cards.filter((c) => filter === "all" || c.heat === filter),
    [config.cards, filter],
  );

  // Which heat tiers actually appear in this deck — only those get a chip.
  const presentHeats = useMemo(
    () => HEAT_ORDER.filter((h) => config.cards.some((c) => c.heat === h)),
    [config.cards],
  );

  const current = drawn > 0 ? (pool[drawn - 1] ?? null) : null;
  const remainingCount = Math.max(0, pool.length - drawn);
  const exhausted = started && pool.length > 0 && drawn >= pool.length;

  // The face-down cards still in the deck (the next ones to be drawn).
  const backCards = pool.slice(drawn, drawn + STACK_DEPTH);

  const draw = useCallback(() => {
    if (shuffling) return;
    setDrawn((d) => {
      if (d >= pool.length) return d;
      return d + 1;
    });
    setStarted(true);
  }, [shuffling, pool.length]);

  const dismissAndDraw = useCallback(
    (dir: number) => {
      setExitDir(dir);
      draw();
    },
    [draw],
  );

  const runShuffle = useCallback(() => {
    if (shuffleTimer.current) clearTimeout(shuffleTimer.current);
    setDrawn(0);
    setStarted(false);
    if (reduceMotion) {
      setShuffling(false);
      return;
    }
    setShuffling(true);
    shuffleTimer.current = setTimeout(() => setShuffling(false), 720);
  }, [reduceMotion]);

  const changeFilter = useCallback(
    (next: HeatFilter) => {
      setFilter(next);
      runShuffle();
    },
    [runShuffle],
  );

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
        dismissAndDraw(info.offset.x < 0 ? -1 : 1);
      }
    },
    [dismissAndDraw],
  );

  // ── Act 1: the 18+ gate ───────────────────────────────────────────
  if (!entered) {
    return <AgeGate onEnter={() => setEntered(true)} />;
  }

  const canDraw = remainingCount > 0 && !shuffling;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-7">
      {/* Heat filter */}
      {presentHeats.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <FilterChip
            active={filter === "all"}
            onClick={() => changeFilter("all")}
          >
            All
          </FilterChip>
          {presentHeats.map((h) => (
            <FilterChip
              key={h}
              active={filter === h}
              accent={HEAT_META[h].accent}
              onClick={() => changeFilter(h)}
            >
              {HEAT_META[h].label}
            </FilterChip>
          ))}
        </div>
      )}

      {/* The deck stage — face-down stack with the flipped card on top. */}
      <div
        className="relative grid h-[27rem] w-full place-items-center"
        style={{ perspective: 1400 }}
      >
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: current
              ? HEAT_META[current.heat].glow
              : "rgba(255,77,109,0.28)",
          }}
        />

        {exhausted ? (
          <OutroCard config={config} onReshuffle={runShuffle} />
        ) : (
          <>
            {/* Face-down deck. Tapping it draws the next card. */}
            <button
              type="button"
              onClick={canDraw ? () => dismissAndDraw(1) : undefined}
              aria-label="Draw a card"
              disabled={!canDraw}
              className="absolute inset-0 z-0 grid place-items-center focus:outline-none disabled:cursor-default"
            >
              <div className="relative size-full">
                {backCards
                  .map((card, i) => ({ card, i }))
                  .reverse()
                  .map(({ card, i }) => (
                    <motion.div
                      key={card.id}
                      className={`${CARD_FRAME} absolute top-1/2 left-1/2`}
                      style={{ zIndex: STACK_DEPTH - i }}
                      initial={false}
                      animate={
                        shuffling ? shuffleOut(i) : stackRest(i, reduceMotion)
                      }
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 20,
                        delay: shuffling ? i * 0.03 : 0,
                      }}
                    >
                      <CardBack title={config.deckTitle} />
                    </motion.div>
                  ))}

                {/* empty-deck hint when nothing is left to draw */}
                {backCards.length === 0 && !current && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm text-white/40">
                    {pool.length === 0
                      ? "No cards in this deck yet"
                      : "That's the deck"}
                  </div>
                )}
              </div>
            </button>

            {/* The flipped-up card, sitting on the deck. Swipe to draw next. */}
            <AnimatePresence custom={exitDir}>
              {current && !shuffling && (
                <PromptCard
                  key={current.id}
                  card={current}
                  assets={assets}
                  reduceMotion={!!reduceMotion}
                  draggable={remainingCount > 0}
                  onDragEnd={onDragEnd}
                  exitDir={exitDir}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Cover copy — only before the first card is drawn. */}
      <AnimatePresence>
        {!current && !exhausted && !shuffling && pool.length > 0 && (
          <motion.div
            key="cover-copy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="-mt-2 max-w-sm text-center"
          >
            <h2 className="font-display text-2xl text-white">
              {config.deckTitle || "for us"}
            </h2>
            {config.intro && (
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {config.intro}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {!exhausted && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => dismissAndDraw(1)}
              disabled={!canDraw}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_8px_30px_rgba(200,29,78,0.45)] transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Flame className="size-4" />
              {current ? "Next card" : "Draw a card"}
            </button>
            <button
              type="button"
              onClick={runShuffle}
              disabled={shuffling || pool.length === 0}
              aria-label="Shuffle the deck"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <Shuffle
                className={`size-4 ${shuffling ? "animate-spin" : ""}`}
              />
              Shuffle
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] text-white/45 uppercase">
            {current && remainingCount > 0 && <Hand className="size-3" />}
            {pool.length === 0
              ? "Add some cards to begin"
              : current && remainingCount > 0
                ? "Swipe the card away for the next"
                : `${Math.min(drawn, pool.length)} of ${pool.length} drawn`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── The 18+ consent gate ─────────────────────────────────────────────
function AgeGate({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] px-7 py-10 text-center backdrop-blur"
    >
      <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
        <Lock className="size-6" />
      </span>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">For grown-ups only</h2>
        <p className="text-sm leading-relaxed text-white/55">
          This deck is for consenting adults sharing a private moment. By
          entering you confirm you{"'"}re 18 or older and you both want to be
          here.
        </p>
      </div>
      <button
        type="button"
        onClick={onEnter}
        className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#7e1426] transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Flame className="size-4" /> We{"'"}re in
      </button>
    </motion.div>
  );
}

// ── Card geometry & motion ───────────────────────────────────────────
// Every card shares this frame so the flipped card lands exactly on the stack.
// Centering is done by framer-motion's x/y ("-50%"), not Tailwind translate, so
// the two don't fight over the `transform` property.
const CARD_FRAME =
  "h-[24rem] w-[18rem] overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.55)] [transform-style:preserve-3d]";

/** Resting transform for the i-th face-down card (0 = top of the pile). */
function stackRest(i: number, reduceMotion: boolean | null) {
  if (reduceMotion) return { x: "-50%", y: "-50%", rotate: 0, scale: 1 };
  const tilt = [0, -2.2, 1.8, -1.4, 2.4, -1][i] ?? 0;
  return {
    x: `calc(-50% + ${i * 1.5}px)`,
    y: `calc(-50% + ${i * 5}px)`,
    rotate: tilt,
    scale: 1 - i * 0.014,
  };
}

/** Riffle "spread" transform — cards fan to alternating sides, then spring back
 *  to {@link stackRest} when shuffling ends. */
function shuffleOut(i: number) {
  const side = i % 2 === 0 ? -1 : 1;
  return {
    x: `calc(-50% + ${side * (115 + i * 9)}px)`,
    y: `calc(-50% - ${i * 7}px)`,
    rotate: side * (16 + i * 4),
    scale: 1,
  };
}

// ── Cards ────────────────────────────────────────────────────────────
function PromptCard({
  card,
  reduceMotion,
  draggable,
  onDragEnd,
  exitDir,
  assets,
}: {
  card: DeckCard;
  reduceMotion: boolean;
  draggable: boolean;
  onDragEnd: (e: unknown, info: PanInfo) => void;
  exitDir: number;
  assets?: Record<string, string>;
}) {
  const meta = HEAT_META[card.heat];
  const variants: Variants = {
    enter: reduceMotion
      ? { x: "-50%", y: "-50%", opacity: 0 }
      : { x: "-50%", y: "-46%", rotateY: -110, opacity: 0 },
    center: {
      x: "-50%",
      y: "-54%",
      rotateY: 0,
      rotate: card.rotation * 0.35,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: `calc(-50% + ${dir * 380}px)`,
      y: "-54%",
      rotate: dir * 22,
      opacity: 0,
      transition: { duration: 0.34, ease: "easeIn" },
    }),
  };
  return (
    <motion.div
      className={`${CARD_FRAME} absolute top-1/2 left-1/2 z-50 flex flex-col px-7 py-7 ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{ background: meta.card }}
      custom={exitDir}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 190, damping: 22 }}
      drag={draggable ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.5}
      onDragEnd={onDragEnd}
    >
      <CardTexture />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: meta.glow }}
      />
      <div className="relative flex items-center justify-between">
        <Flames heat={card.heat} />
        <span
          className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase"
          style={{ color: meta.accent, background: "rgba(255,255,255,0.08)" }}
        >
          {meta.label}
        </span>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <CatalogImage fileId={card.image?.fileId} assets={assets} />
        <p className="text-center font-display text-xl leading-relaxed text-white">
          {card.prompt}
        </p>
      </div>
      <p className="relative text-center text-[0.6rem] font-medium tracking-[0.25em] text-white/30 uppercase">
        Desire Deck
      </p>
    </motion.div>
  );
}

function OutroCard({
  config,
  onReshuffle,
}: {
  config: DeckConfig;
  onReshuffle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`${CARD_FRAME} relative flex flex-col px-7 py-8`}
      style={{
        background: "linear-gradient(155deg, #3a1430 0%, #531a3c 100%)",
      }}
    >
      <CardTexture />
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <Flame className="mb-4 size-7 text-[#ff8fae]" />
        <h2 className="font-display text-2xl text-white">
          That{"'"}s the deck
        </h2>
        {config.outro && (
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {config.outro}
          </p>
        )}
        <button
          type="button"
          onClick={onReshuffle}
          className="mt-7 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          <RotateCcw className="size-3.5" /> Shuffle again
        </button>
      </div>
    </motion.div>
  );
}

/** The patterned back of a face-down card. */
function CardBack({ title }: { title: string }) {
  return (
    <div
      className="relative grid size-full place-items-center"
      style={{
        background:
          "repeating-linear-gradient(45deg, #2a0a18 0px, #2a0a18 11px, #34101f 11px, #34101f 22px)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-3 rounded-[1.3rem] border border-[#ff4d6d]/25"
      />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
          <Flame className="size-5" />
        </span>
        {title && (
          <span className="font-hand max-w-[12rem] truncate text-base text-[#ffb3c4]">
            {title}
          </span>
        )}
      </div>
    </div>
  );
}

/** A faint grain so the card faces feel like printed stock, not flat gradients. */
function CardTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

// ── Heat filter chip ─────────────────────────────────────────────────
function FilterChip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent text-[#3a0a16]"
          : "border-white/15 text-white/55 hover:text-white/85",
      ].join(" ")}
      style={active ? { background: accent ?? "#ffffff" } : undefined}
    >
      {children}
    </button>
  );
}

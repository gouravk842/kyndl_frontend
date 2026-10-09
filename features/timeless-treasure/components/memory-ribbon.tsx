"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  Letter,
  ReelFrame,
  SceneTokens,
  Tag,
  TreasureTheme,
} from "../config";
import { PhotoPrint } from "./photo-print";

/**
 * The pocket stage — the recipient draws the memories out one at a time. Exactly
 * one card ever hangs from the pocket, so the stage is a *fixed height*: pressing
 * ▸ folds the current card back up into the pocket while the next swings out of
 * it (the two motions are mirror images — one goes in as the other comes out),
 * and ▹ never grows the page. It opens on a written note, runs the photos (each
 * with the sender's lines pencilled beside it), and closes on the printed
 * dedication — a message at the start, a message at the end.
 *
 * All 2.5D CSS `preserve-3d`, hinged at the pocket, never WebGL.
 */

/** Autoplay dwell per card, in ms. */
const AUTOPLAY_MS = 3600;

type Item =
  | { kind: "note"; key: string }
  | { kind: "photo"; key: string; frame: ReelFrame; index: number }
  | { kind: "dedication"; key: string };

/** A card swings down out of the pocket (visible) and folds back up into it. */
function cardVariants(reduceMotion: boolean | null): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    };
  }
  return {
    hidden: { opacity: 0, y: -34, scaleY: 0.18, rotateX: 64 },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      rotateX: 0,
      transition: { type: "spring", stiffness: 74, damping: 15, mass: 0.9 },
    },
  };
}

export function MemoryRibbon({
  frames,
  urlFor,
  theme,
  scene,
  tag,
  letter,
  senderName,
  recipientName,
  reduceMotion,
  onClose,
}: {
  frames: ReelFrame[];
  urlFor: (frame: ReelFrame) => string | null;
  theme: TreasureTheme;
  scene: SceneTokens;
  tag: Tag;
  letter: Letter;
  senderName: string;
  recipientName: string;
  reduceMotion: boolean | null;
  /** Fold the whole album shut, back to the closed cover. */
  onClose: () => void;
}) {
  // Build the running order: an opening note, the photos, a closing dedication.
  const hasNote = Boolean(letter.heading.trim() || letter.body.trim());
  const items: Item[] = [
    ...(hasNote ? [{ kind: "note", key: "note" } as const] : []),
    ...frames.map(
      (frame, index) =>
        ({ kind: "photo", key: frame.id, frame, index }) as const,
    ),
    { kind: "dedication", key: "dedication" } as const,
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const atStart = active <= 0;
  const atEnd = active >= items.length - 1;

  // Manual navigation always pauses autoplay.
  const prev = useCallback(() => {
    setPlaying(false);
    setActive((a) => Math.max(0, a - 1));
  }, []);
  const next = useCallback(() => {
    setPlaying(false);
    setActive((a) => Math.min(items.length - 1, a + 1));
  }, [items.length]);

  // Play/pause; from the last card, ▶ replays from the top.
  const togglePlay = useCallback(() => {
    if (atEnd) {
      setActive(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [atEnd]);

  // Autoplay: while playing, advance a card at a time until the last one. At the
  // end it simply stops scheduling (the button then keys off `atEnd` to offer a
  // replay) — no setState needed here to halt it.
  useEffect(() => {
    if (!playing || atEnd) return;
    const t = setTimeout(
      () => setActive((a) => Math.min(items.length - 1, a + 1)),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(t);
  }, [playing, atEnd, active, items.length]);

  // Keyboard: ←/→ to draw memories in and out.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Clamp in case the frame list shrank under us (live builder edits).
  const current = items[Math.min(active, items.length - 1)]!;
  const photoNo = current.kind === "photo" ? current.index + 1 : 0;

  return (
    <div className="relative flex w-full max-w-md flex-col items-center px-3 sm:px-0">
      {/* the leather pocket lip the card is drawn out from */}
      <div
        aria-hidden
        className="relative z-20 h-4 w-[min(100%,248px)] rounded-t-[3px] sm:w-[274px]"
        style={{
          background: scene.leatherDark,
          boxShadow: `inset 0 2px 3px ${scene.leatherSheen}, 0 6px 14px -6px rgba(0,0,0,0.5)`,
        }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3"
          style={{
            background: `linear-gradient(to bottom, transparent, ${scene.pocketShadow})`,
          }}
        />
      </div>

      {/* THE STAGE — fixed height; one card hangs from the pocket at a time. */}
      <div
        className="relative h-[380px] w-full max-w-md sm:h-[400px]"
        style={{ perspective: 1500 }}
      >
        <AnimatePresence initial={!reduceMotion}>
          <motion.div
            key={current.key}
            variants={cardVariants(reduceMotion)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-3 left-1/2 -translate-x-1/2"
            style={{
              transformOrigin: "center top",
              transformStyle: "preserve-3d",
            }}
          >
            {current.kind === "photo" ? (
              <PhotoPrint
                url={current.frame.fileId ? urlFor(current.frame) : null}
                caption={current.frame.caption}
                date={current.frame.date}
                theme={theme}
                tilt={current.index % 2 === 0 ? -1.1 : 1.1}
                reduceMotion={reduceMotion}
              />
            ) : current.kind === "note" ? (
              <NoteCard
                letter={letter}
                theme={theme}
                recipientName={recipientName}
              />
            ) : (
              <DedicationPanel
                tag={tag}
                senderName={senderName}
                recipientName={recipientName}
                theme={theme}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* live caption echo for screen readers */}
      <p ref={liveRef} aria-live="polite" className="sr-only">
        {current.kind === "photo"
          ? `Memory ${photoNo} of ${frames.length}. ${current.frame.caption}`
          : current.kind === "note"
            ? "Opening note"
            : "Dedication"}
      </p>

      {/* ── TRANSPORT — draw the next memory out / fold the last back in ──── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="fixed bottom-6 left-1/2 z-[70] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 rounded-full py-1.5 pr-2 pl-2 shadow-2xl sm:gap-1.5"
        style={{
          background: scene.leather,
          border: `1px solid ${scene.stitch}66`,
          boxShadow:
            "0 16px 30px -14px rgba(30,20,8,0.5), inset 0 1px 0 rgba(255,255,255,0.16)",
          paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))",
        }}
      >
        <TransportButton
          label="Close the album"
          scene={scene}
          disabled={false}
          onClick={onClose}
        >
          <X className="size-[18px]" />
        </TransportButton>

        <span
          aria-hidden
          className="mx-0.5 h-6 w-px shrink-0"
          style={{ background: `${scene.stitch}44` }}
        />

        <TransportButton
          label="Previous — fold this back into the pocket"
          scene={scene}
          disabled={atStart}
          onClick={prev}
        >
          <ChevronLeft className="size-5" />
        </TransportButton>

        <TransportButton
          label={
            atEnd ? "Replay from the start" : playing ? "Pause" : "Play through"
          }
          scene={scene}
          disabled={false}
          onClick={togglePlay}
          primary
          pulse={atStart && !playing}
          theme={theme}
        >
          {atEnd ? (
            <RotateCcw className="size-5" />
          ) : playing ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5 translate-x-[1px]" />
          )}
        </TransportButton>

        <TransportButton
          label="Next — draw the next memory out of the pocket"
          scene={scene}
          disabled={atEnd}
          onClick={next}
        >
          <ChevronRight className="size-5" />
        </TransportButton>

        <span
          aria-hidden
          className="mx-0.5 h-6 w-px shrink-0"
          style={{ background: `${scene.stitch}44` }}
        />

        <div
          className="flex min-w-[54px] items-center justify-center gap-1.5 px-1 pr-1.5 text-center text-xs font-semibold tracking-[0.14em] tabular-nums"
          style={{ color: scene.foil }}
        >
          {current.kind === "photo" ? (
            <span>
              {String(photoNo).padStart(2, "0")} /{" "}
              {String(frames.length).padStart(2, "0")}
            </span>
          ) : current.kind === "note" ? (
            <Mail className="size-4" />
          ) : (
            <Heart className="size-4" fill={scene.foil} />
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TransportButton({
  children,
  label,
  onClick,
  disabled,
  scene,
  primary = false,
  pulse = false,
  theme,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  scene: SceneTokens;
  primary?: boolean;
  pulse?: boolean;
  theme?: TreasureTheme;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.92 }}
      animate={pulse && !disabled ? { scale: [1, 1.08, 1] } : undefined}
      transition={
        pulse
          ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
      className="grid size-11 place-items-center rounded-full transition-opacity disabled:opacity-30"
      style={
        primary
          ? {
              background: theme?.accent ?? scene.foil,
              color: "#fff",
              boxShadow: "0 4px 10px -3px rgba(0,0,0,0.5)",
            }
          : { color: scene.foil }
      }
    >
      {children}
    </motion.button>
  );
}

/** The opening beat — the sender's written note, on cardstock. */
function NoteCard({
  letter,
  theme,
  recipientName,
}: {
  letter: Letter;
  theme: TreasureTheme;
  recipientName: string;
}) {
  const heading = letter.heading.trim() || "For you";
  const body = letter.body.trim();
  const to = recipientName.trim();

  return (
    <div
      className="relative flex h-[min(340px,70svh)] w-[min(100vw-2rem,300px)] flex-col rounded-[4px] px-5 pt-8 pb-6 sm:h-[340px] sm:w-[320px] sm:px-7"
      style={{
        background: theme.paper,
        boxShadow:
          "0 26px 40px -22px rgba(0,0,0,0.55), 0 3px 8px -3px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-1 rounded-[1px]"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.55), rgba(230,222,205,0.4))",
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
        }}
      />
      <p className="font-cursive text-3xl" style={{ color: theme.accent }}>
        {heading}
      </p>
      {to && (
        <p
          className="mt-0.5 text-[10px] font-semibold tracking-[0.3em] uppercase"
          style={{ color: theme.ink, opacity: 0.5 }}
        >
          for {to}
        </p>
      )}
      <span
        aria-hidden
        className="my-3 block h-px w-12"
        style={{ background: theme.paperEdge }}
      />
      <p
        className="font-hand grow overflow-y-auto pr-1 text-[18px] leading-relaxed whitespace-pre-line"
        style={{ color: theme.ink }}
      >
        {body ||
          "A little something is waiting here — the sender will write it before they share."}
      </p>
    </div>
  );
}

/**
 * The closing beat — the printed dedication, echoing the engraved plate: script
 * title, occasion, a from→for line and a kiss. What the whole strip builds to.
 */
function DedicationPanel({
  tag,
  senderName,
  recipientName,
  theme,
}: {
  tag: Tag;
  senderName: string;
  recipientName: string;
  theme: TreasureTheme;
}) {
  const title = tag.title.trim() || "Made of Happy Memories";
  const occasion = tag.occasion.trim();
  const from = senderName.trim();
  const to = recipientName.trim();

  return (
    <div
      className="relative flex h-[min(340px,70svh)] w-[min(100vw-2rem,280px)] flex-col items-center justify-center rounded-[4px] px-5 text-center sm:h-[340px] sm:w-[300px] sm:px-7"
      style={{
        background: theme.paper,
        boxShadow:
          "0 26px 40px -22px rgba(0,0,0,0.55), 0 3px 8px -3px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    >
      <p
        className="font-cursive text-[28px] leading-tight sm:text-[30px]"
        style={{ color: theme.accent }}
      >
        {title}
      </p>

      <span
        aria-hidden
        className="mx-auto my-4 block h-px w-14"
        style={{ background: theme.paperEdge }}
      />

      {occasion && (
        <p
          className="text-[11px] font-semibold tracking-[0.28em] uppercase"
          style={{ color: theme.ink, opacity: 0.72 }}
        >
          {occasion}
        </p>
      )}
      {(from || to) && (
        <p
          className="mt-2 text-[13px] tracking-wide"
          style={{ color: theme.ink }}
        >
          {from && to ? `${from} → ${to}` : from ? `From ${from}` : `For ${to}`}
        </p>
      )}
      <p
        className="font-cursive mt-3 text-2xl"
        style={{ color: theme.ink, opacity: 0.85 }}
      >
        x
      </p>
    </div>
  );
}

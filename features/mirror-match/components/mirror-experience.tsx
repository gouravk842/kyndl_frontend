"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import { Check, Minus, Sparkles, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { applyMirror } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import { creationService } from "@/services/creations/creation.service";
import type { MirrorMatchReveal } from "@/types/creation";

import {
  type Answer,
  ANSWER_META,
  MIRROR_CONFIG,
  type MirrorContent,
  MOOD_META,
  type Reveal,
} from "../config";
import { computeReveal } from "../lib/reveal";
import { LookingGlass, MirrorProgress, MirrorStage } from "./atmosphere";
import { RevealView } from "./reveal-view";

type Phase = "intro" | "answering" | "submitting" | "done";

function toReveal(raw: MirrorMatchReveal | Reveal): Reveal {
  return {
    matches: raw.matches.map((m) => ({
      id: m.id,
      label: m.label,
      mood: m.mood as Reveal["matches"][number]["mood"],
    })),
    softMatches: raw.softMatches.map((m) => ({
      id: m.id,
      label: m.label,
      mood: m.mood as Reveal["softMatches"][number]["mood"],
    })),
    total: raw.total,
  };
}

/**
 * Partner-facing Mirror Match — looking-glass intro, glass prompt cards, then
 * the mirror-open reveal. No AgeGate.
 */
export function MirrorExperience(props: {
  content?: MirrorContent;
  token?: string;
  bare?: boolean;
}) {
  return (
    <DemoGate
      authored={props.content}
      fallback={MIRROR_CONFIG}
      includeAdult={false}
      apply={applyMirror}
    >
      {(content) => <MirrorPlay {...props} content={content} />}
    </DemoGate>
  );
}

function MirrorPlay({
  content,
  token,
  bare = false,
}: {
  content: MirrorContent;
  token?: string;
  bare?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [flash, setFlash] = useState<Answer | null>(null);

  const items = content.items;
  const current = items[index] ?? null;

  const submit = useCallback(
    async (finalAnswers: Record<string, Answer>) => {
      setPhase("submitting");
      if (!token) {
        setReveal(computeReveal(content, finalAnswers));
        setPhase("done");
        return;
      }
      try {
        const res = await creationService.submitMirrorMatch(token, {
          answers: finalAnswers,
          responderName: content.recipientName,
        });
        setReveal(toReveal(res.reveal));
        setPhase("done");
      } catch {
        toast.error("Couldn't send your answers — try again.");
        setPhase("answering");
      }
    },
    [token, content],
  );

  const answer = useCallback(
    (value: Answer) => {
      if (!current || phase === "submitting") return;
      setFlash(value);
      window.setTimeout(() => setFlash(null), 280);
      const next = { ...answers, [current.id]: value };
      setAnswers(next);
      if (index + 1 >= items.length) {
        void submit(next);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, answers, index, items.length, submit, phase],
  );

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      if (info.offset.x > 90) answer("yes");
      else if (info.offset.x < -90) answer("no");
      else if (Math.abs(info.offset.y) > 110) answer("maybe");
    },
    [answer],
  );

  const body =
    phase === "done" && reveal ? (
      <RevealView
        reveal={reveal}
        intro={
          reveal.matches.length + reveal.softMatches.length > 0
            ? `Out of ${reveal.total} — here's what you both reflected.`
            : undefined
        }
        occasion={content.occasion}
        ownerName={content.ownerName}
        recipientName={content.recipientName}
        shareToken={token}
      />
    ) : phase === "intro" ? (
      <Intro
        content={content}
        reduceMotion={!!reduceMotion}
        onStart={() => setPhase("answering")}
      />
    ) : (
      <Answering
        content={content}
        current={current}
        index={index}
        itemsLength={items.length}
        phase={phase}
        flash={flash}
        reduceMotion={!!reduceMotion}
        onDragEnd={onDragEnd}
        onAnswer={answer}
      />
    );

  if (bare) return body;

  return (
    <MirrorStage
      occasion={content.occasion}
      className="w-full max-w-lg rounded-[2rem]"
      compact
    >
      {body}
    </MirrorStage>
  );
}

function Intro({
  content,
  reduceMotion,
  onStart,
}: {
  content: MirrorContent;
  reduceMotion: boolean;
  onStart: () => void;
}) {
  const empty = content.items.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="flex w-full flex-col items-center gap-7"
    >
      <LookingGlass size="lg">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-2 text-[0.65rem] font-semibold tracking-[0.28em] text-[#B11226]/80 uppercase"
        >
          {content.ownerName
            ? `${content.ownerName} · for you`
            : "A moment for two"}
        </motion.p>
        <h2 className="font-display text-[1.65rem] leading-tight text-[#2a1a14] sm:text-3xl">
          {content.title || "Do we see us the same way?"}
        </h2>
        <p className="mt-3 font-cursive text-xl text-[#8E1020]/85">
          look closer
        </p>
        {content.intro ? (
          <p className="mt-4 max-w-[14rem] text-[0.8rem] leading-relaxed text-[#5a3223]/65">
            {content.intro}
          </p>
        ) : (
          <p className="mt-4 max-w-[14rem] text-[0.8rem] leading-relaxed text-[#5a3223]/65">
            Answer honestly — your picks stay private. Only what you both feel
            will open in the glass.
          </p>
        )}
      </LookingGlass>

      <div className="flex flex-col items-center gap-3">
        <motion.button
          type="button"
          onClick={onStart}
          disabled={empty}
          whileHover={empty ? undefined : { scale: 1.04 }}
          whileTap={empty ? undefined : { scale: 0.97 }}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(177,18,38,0.28)] disabled:opacity-45"
          style={{
            background:
              "linear-gradient(135deg, #D4A373 0%, #B11226 55%, #8E1020 100%)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          <Sparkles className="size-4" />
          {empty ? "No prompts yet" : "Step into the mirror"}
        </motion.button>
        <p className="font-hand text-sm text-[#5a3223]/50">
          {content.items.length}{" "}
          {content.items.length === 1 ? "reflection" : "reflections"} waiting
        </p>
      </div>
    </motion.div>
  );
}

function Answering({
  content,
  current,
  index,
  itemsLength,
  phase,
  flash,
  reduceMotion,
  onDragEnd,
  onAnswer,
}: {
  content: MirrorContent;
  current: MirrorContent["items"][number] | null;
  index: number;
  itemsLength: number;
  phase: Phase;
  flash: Answer | null;
  reduceMotion: boolean;
  onDragEnd: (e: unknown, info: PanInfo) => void;
  onAnswer: (a: Answer) => void;
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      <div className="flex w-full items-center justify-between gap-3 px-1">
        <p className="font-hand text-sm text-[#5a3223]/55">
          {content.recipientName ? `For ${content.recipientName}` : "Your turn"}
        </p>
        <MirrorProgress index={index} total={itemsLength} />
      </div>

      <div
        className="relative grid h-[26rem] w-full place-items-center"
        style={{ perspective: 1400 }}
      >
        {/* Soft drag hints */}
        <span className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[0.65rem] font-semibold tracking-[0.2em] text-[#5a3223]/35 uppercase sm:block">
          Not really
        </span>
        <span className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 rotate-90 text-[0.65rem] font-semibold tracking-[0.2em] text-[#3a9a5c]/55 uppercase sm:block">
          That’s us
        </span>

        <AnimatePresence mode="popLayout">
          {current && phase !== "submitting" && (
            <motion.div
              key={current.id}
              drag={!reduceMotion}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.85}
              onDragEnd={onDragEnd}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.88, rotateY: -12 }
              }
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative flex aspect-[3/4] w-[17.5rem] cursor-grab flex-col overflow-hidden rounded-[1.6rem] active:cursor-grabbing"
              style={{
                background:
                  "linear-gradient(165deg, #fffdf9 0%, #f8ebe0 55%, #f0dccb 100%)",
                boxShadow:
                  "0 28px 50px rgba(90,50,35,0.18), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px rgba(212,163,115,0.45)",
              }}
            >
              {/* Glass sheen */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#D4A373]/10"
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["0%", "180%"] }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1.8,
                }}
              />

              {/* Flash tint on answer */}
              <AnimatePresence>
                {flash && (
                  <motion.div
                    key={flash}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0"
                    style={{ background: ANSWER_META[flash].color }}
                  />
                )}
              </AnimatePresence>

              <div className="relative flex items-center justify-between px-5 pt-5">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase"
                  style={{
                    color: MOOD_META[current.mood].color,
                    background: `${MOOD_META[current.mood].color}18`,
                    boxShadow: `inset 0 0 0 1px ${MOOD_META[current.mood].color}33`,
                  }}
                >
                  {MOOD_META[current.mood].label}
                </span>
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    background: MOOD_META[current.mood].color,
                    boxShadow: `0 0 12px ${MOOD_META[current.mood].color}`,
                  }}
                  aria-hidden
                />
              </div>

              <div className="relative flex flex-1 flex-col items-center justify-center px-6">
                <p className="text-center font-display text-[1.35rem] leading-snug text-[#2a1a14]">
                  {current.label}
                </p>
                <p className="mt-5 font-cursive text-lg text-[#B11226]/55">
                  what do you feel?
                </p>
              </div>

              <div className="relative px-5 pb-5 text-center text-[0.65rem] tracking-wide text-[#5a3223]/35 uppercase">
                Swipe or tap below
              </div>
            </motion.div>
          )}

          {phase === "submitting" && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <LookingGlass size="sm">
                <p className="font-cursive text-2xl text-[#8E1020]">opening…</p>
                <p className="mt-2 text-xs text-[#5a3223]/55">
                  Finding your reflections
                </p>
              </LookingGlass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase !== "submitting" && (
        <div className="flex items-end gap-4">
          <AnswerSeal answer="no" onClick={() => onAnswer("no")}>
            <X className="size-5" />
          </AnswerSeal>
          <AnswerSeal answer="maybe" onClick={() => onAnswer("maybe")} compact>
            <Minus className="size-4" />
          </AnswerSeal>
          <AnswerSeal answer="yes" onClick={() => onAnswer("yes")}>
            <Check className="size-5" />
          </AnswerSeal>
        </div>
      )}
    </div>
  );
}

function AnswerSeal({
  answer,
  onClick,
  children,
  compact,
}: {
  answer: Answer;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const meta = ANSWER_META[answer];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={meta.label}
      whileHover={{ y: -3, scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={["flex flex-col items-center gap-1.5", compact ? "" : ""].join(
        " ",
      )}
    >
      <span
        className={[
          "grid place-items-center rounded-full border-2 bg-[#fffaf6] shadow-[0_8px_24px_rgba(90,50,35,0.12)]",
          compact ? "size-12" : "size-[3.75rem]",
        ].join(" ")}
        style={{ borderColor: meta.color, color: meta.color }}
      >
        {children}
      </span>
      <span className="font-hand text-xs" style={{ color: meta.color }}>
        {meta.label}
      </span>
    </motion.button>
  );
}

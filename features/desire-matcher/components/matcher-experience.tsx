"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import { Check, Flame, Lock, Minus, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { CatalogImage } from "@/features/activity-bank/components/catalog-image";
import { applyMatcher } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import { Flames } from "@/features/desire-deck/components/flames";
import { creationService } from "@/services/creations/creation.service";

import {
  type Answer,
  ANSWER_META,
  HEAT_META,
  MATCHER_CONFIG,
  type MatcherContent,
  type Reveal,
} from "../config";
import { computeReveal } from "../lib/reveal";
import { RevealView } from "./reveal-view";

/**
 * The partner-facing Matcher. Reads its content from props (defaults to the
 * bundled sample for the marketing demo). With a share `token` it submits the
 * answers to the backend and shows the server-computed reveal; without one
 * (demo / builder preview) it computes the reveal locally from the sample's
 * owner answers.
 *
 * Acts: 18+ gate → intro → answer each item (swipe / tap yes·maybe·no) → reveal.
 */
type Phase = "intro" | "answering" | "submitting" | "done";

export function MatcherExperience(props: {
  content?: MatcherContent;
  token?: string;
  skipGate?: boolean;
  assets?: Record<string, string>;
}) {
  return (
    <DemoGate
      authored={props.content}
      fallback={MATCHER_CONFIG}
      includeAdult
      apply={applyMatcher}
    >
      {(content) => <MatcherPlay {...props} content={content} />}
    </DemoGate>
  );
}

function MatcherPlay({
  content,
  token,
  skipGate = false,
  assets,
}: {
  content: MatcherContent;
  token?: string;
  skipGate?: boolean;
  assets?: Record<string, string>;
}) {
  const reduceMotion = useReducedMotion();
  const [entered, setEntered] = useState(skipGate);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [reveal, setReveal] = useState<Reveal | null>(null);

  const items = content.items;
  const current = items[index] ?? null;

  const submit = useCallback(
    async (finalAnswers: Record<string, Answer>) => {
      setPhase("submitting");
      if (!token) {
        // Demo / preview — compute locally against the sample's owner answers.
        setReveal(computeReveal(content, finalAnswers));
        setPhase("done");
        return;
      }
      try {
        const res = await creationService.submitMatch(token, {
          answers: finalAnswers,
          responderName: content.recipientName,
        });
        // The server guarantees each item's heat is a valid tier.
        setReveal(res.reveal as Reveal);
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
      if (!current) return;
      const next = { ...answers, [current.id]: value };
      setAnswers(next);
      if (index + 1 >= items.length) {
        void submit(next);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, answers, index, items.length, submit],
  );

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      if (info.offset.x > 90) answer("yes");
      else if (info.offset.x < -90) answer("no");
    },
    [answer],
  );

  // ── 18+ gate ───────────────────────────────────────────────────────
  if (!entered) return <AgeGate onEnter={() => setEntered(true)} />;

  // ── Reveal ─────────────────────────────────────────────────────────
  if (phase === "done" && reveal) {
    const intro =
      reveal.matches.length + reveal.maybes.length > 0
        ? `Out of ${reveal.total}, here's where you overlap.`
        : undefined;
    return <RevealView reveal={reveal} intro={intro} shareToken={token} />;
  }

  // ── Intro ──────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
      >
        <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
          <Flame className="size-6" />
        </span>
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.25em] text-[#ff8fae] uppercase">
            {content.ownerName
              ? `${content.ownerName} made this for you`
              : "A little game for two"}
          </p>
          <h2 className="font-display text-2xl text-white">
            {content.title || "What are we both into?"}
          </h2>
          {content.intro && (
            <p className="text-sm leading-relaxed text-white/60">
              {content.intro}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPhase("answering")}
          disabled={items.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(200,29,78,0.45)] transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50"
        >
          {items.length === 0 ? "No items yet" : "Start answering"}
        </button>
        <p className="text-xs text-white/35">
          {items.length} {items.length === 1 ? "thing" : "things"} to answer ·
          your picks stay private
        </p>
      </motion.div>
    );
  }

  // ── Answering ──────────────────────────────────────────────────────
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      {/* progress */}
      <div className="flex w-full max-w-xs items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e]"
            animate={{ width: `${(index / items.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-medium tracking-wide text-white/45">
          {Math.min(index + 1, items.length)}/{items.length}
        </span>
      </div>

      {/* card */}
      <div
        className="relative grid h-[22rem] w-full place-items-center"
        style={{ perspective: 1200 }}
      >
        {/* hint chips behind the card */}
        <span className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-wide text-[#ff5a6a]/60 uppercase">
          ← No
        </span>
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-wide text-[#3ad17f]/70 uppercase">
          Yes →
        </span>

        <AnimatePresence mode="popLayout">
          {current && phase !== "submitting" && (
            <motion.div
              key={current.id}
              drag="x"
              dragSnapToOrigin
              dragElastic={0.6}
              onDragEnd={onDragEnd}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 16 }
              }
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="relative flex aspect-[3/4] w-[17rem] cursor-grab flex-col overflow-hidden rounded-[1.75rem] border border-white/12 px-7 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] active:cursor-grabbing"
              style={{ background: HEAT_META[current.heat].card }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
                style={{ background: HEAT_META[current.heat].glow }}
              />
              <div className="relative flex items-center justify-between">
                <Flames heat={current.heat} />
                <span
                  className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase"
                  style={{
                    color: HEAT_META[current.heat].accent,
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  {HEAT_META[current.heat].label}
                </span>
              </div>
              <div className="relative flex flex-1 items-center justify-center">
                <p className="text-center font-display text-xl leading-relaxed text-white">
                  {current.label}
                </p>
                <CatalogImage fileId={current.image?.fileId} assets={assets} />
              </div>
            </motion.div>
          )}
          {phase === "submitting" && (
            <motion.p
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="animate-pulse font-display text-lg text-white/70"
            >
              Finding your matches…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* answer buttons */}
      {phase !== "submitting" && (
        <div className="flex items-center gap-3">
          <AnswerButton answer="no" onClick={() => answer("no")}>
            <X className="size-5" />
          </AnswerButton>
          <AnswerButton answer="maybe" onClick={() => answer("maybe")}>
            <Minus className="size-5" />
          </AnswerButton>
          <AnswerButton answer="yes" onClick={() => answer("yes")}>
            <Check className="size-5" />
          </AnswerButton>
        </div>
      )}
    </div>
  );
}

function AnswerButton({
  answer,
  onClick,
  children,
}: {
  answer: Answer;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const meta = ANSWER_META[answer];
  const big = answer !== "maybe";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={meta.label}
      className={[
        "grid place-items-center rounded-full border-2 text-white transition-transform hover:scale-110 active:scale-95",
        big ? "size-16" : "size-12",
      ].join(" ")}
      style={{ borderColor: meta.color, color: meta.color }}
    >
      {children}
    </button>
  );
}

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
          This is for consenting adults sharing a private moment. By entering
          you confirm you{"'"}re 18 or older and you both want to be here.
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

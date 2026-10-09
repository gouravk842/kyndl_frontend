"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { formatTarget } from "@/features/countdown/lib/time";
import { useMounted } from "@/hooks/use-mounted";

import type { Reason, TwentyFourReasonsContent } from "../config";
import { loadSeen, markSeen } from "../lib/seen";
import { nextUnlockRemaining, partitionReasons } from "../lib/unlock";
import { DayStage } from "./day-atmosphere";
import { DayRing, type DayRingHandle } from "./day-ring";
import { ReasonLetter } from "./reason-letter";
import { ReasonTile } from "./reason-tile";

function formatRemaining(r: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  reached: boolean;
}): string {
  if (r.reached) return "now";
  const parts: string[] = [];
  if (r.days > 0) parts.push(`${r.days}d`);
  if (r.hours > 0 || r.days > 0) parts.push(`${r.hours}h`);
  parts.push(`${r.minutes}m`);
  parts.push(`${String(r.seconds).padStart(2, "0")}s`);
  return parts.join(" ");
}

export function ReasonsExperience({
  content,
  assets = {},
  seenScope = "demo",
  now: nowProp,
  bare = false,
}: {
  content: TwentyFourReasonsContent;
  assets?: Record<string, string>;
  seenScope?: string;
  now?: number;
  bare?: boolean;
}) {
  const mounted = useMounted();
  const ringRef = useRef<DayRingHandle>(null);
  const [tick, setTick] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selected, setSelected] = useState<Reason | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
    setSeen(loadSeen(seenScope));
  }, [seenScope]);

  // eslint-disable-next-line react-hooks/purity -- live clock; tests pass `now` so this stays deterministic
  const clockNow = nowProp ?? Date.now();
  const now = mounted ? clockNow : 0;
  void tick;

  const { open, locked, complete } = partitionReasons(content.reasons, now);
  const { reason: next, remaining } = nextUnlockRemaining(content.reasons, now);

  useEffect(() => {
    if (!mounted || complete || nowProp != null) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [mounted, complete, nowProp]);

  const openIds = useMemo(() => new Set(open.map((r) => r.id)), [open]);
  const newlyOpened = useMemo(
    () => open.filter((r) => !seen.has(r.id)),
    [open, seen],
  );
  const showCatchUp = mounted && !bannerDismissed && newlyOpened.length > 0;
  const newIds = useMemo(
    () => new Set(newlyOpened.map((r) => r.id)),
    [newlyOpened],
  );

  function remember(ids: string[]) {
    markSeen(seenScope, ids);
    setSeen((prev) => {
      const nextSet = new Set(prev);
      for (const id of ids) nextSet.add(id);
      return nextSet;
    });
  }

  function openLetter(reason: Reason) {
    if (!openIds.has(reason.id)) {
      const hint =
        reason.teaser.trim() ||
        (reason.unlockAt ? formatTarget(reason.unlockAt) : "Still sealed");
      toast.message("Still sealed", { description: hint });
      return;
    }
    setSelected(reason);
    remember([reason.id]);
  }

  function dismissCatchUp() {
    const first = newlyOpened[0];
    setBannerDismissed(true);
    if (first) {
      ringRef.current?.spinTo(first.id);
    } else {
      remember(newlyOpened.map((r) => r.id));
    }
  }

  const count = content.reasons.length;
  const finaleLine =
    count >= 24 ? "All 24 — yours to keep" : `All ${count} — yours to keep`;

  const ringReasons = content.reasons.map((r) => ({
    ...r,
    open: openIds.has(r.id),
    isNew: openIds.has(r.id) && newIds.has(r.id),
    isNext: next?.id === r.id,
  }));

  const body = (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-8 sm:py-14">
      <header className="text-center">
        <motion.p
          className="font-cursive text-2xl text-[#8E1020]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {content.ownerName.trim()
            ? `${content.ownerName} wrote you a day`
            : "A day written for you"}
        </motion.p>
        <motion.h1
          className="font-display mt-1 text-4xl tracking-tight text-[#2a1a14] sm:text-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          {content.title || "24 Reasons"}
        </motion.h1>
        {content.recipientName.trim() ? (
          <p className="mt-2 font-hand text-base text-[#5a3223]/65">
            for {content.recipientName}
          </p>
        ) : null}
        {content.intro.trim() ? (
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5a3223]/60">
            {content.intro}
          </p>
        ) : (
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5a3223]/60">
            Spin the ring — when it lands, a seal breaks and a reason opens.
          </p>
        )}
      </header>

      <AnimatePresence>
        {showCatchUp ? (
          <motion.div
            key="catch-up"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2 rounded-2xl border border-[#D4A373]/45 bg-[#fff8f0]/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-[#5a433a]">
              <span className="font-cursive text-lg text-[#8E1020]">
                {newlyOpened.length} new
              </span>{" "}
              seal{newlyOpened.length === 1 ? "" : "s"} ready to spin
            </p>
            <button
              type="button"
              onClick={dismissCatchUp}
              className="shrink-0 rounded-full bg-gradient-to-r from-[#D4A373] to-[#B11226] px-4 py-1.5 text-xs font-semibold text-white"
            >
              Spin for me
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {content.reasons.length === 0 ? (
        <p className="mx-auto max-w-sm rounded-xl border border-dashed border-[#e3d2c5] bg-white/50 px-4 py-10 text-center text-sm text-[#92786c]">
          No reasons in this keepsake yet.
        </p>
      ) : (
        <>
          <DayRing
            ref={ringRef}
            reasons={ringReasons}
            complete={mounted && complete}
            finaleLine={finaleLine}
            countdown={
              mounted && !complete && next
                ? formatRemaining(remaining)
                : undefined
            }
            nextLabel={
              next
                ? `Reason ${String(next.n).padStart(2, "0")}${
                    locked.length > 1 ? ` · ${locked.length} sealed` : ""
                  }`
                : undefined
            }
            onReveal={openLetter}
          />

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3 px-1">
              <h2 className="font-display text-lg text-[#2a1a14]">
                Opened letters
              </h2>
              <p className="font-hand text-sm text-[#92786c]">
                or pick one below
              </p>
            </div>
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
              {content.reasons.map((r) => (
                <ReasonTile
                  key={r.id}
                  reason={r}
                  open={openIds.has(r.id)}
                  isNew={openIds.has(r.id) && newIds.has(r.id)}
                  onOpen={openLetter}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <AnimatePresence>
        {mounted && complete && count > 0 ? (
          <motion.footer
            key="finale"
            className="mx-auto max-w-md py-2 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            {content.ownerName.trim() ? (
              <p className="text-sm text-[#7a6258]">
                With love from {content.ownerName}
              </p>
            ) : null}
          </motion.footer>
        ) : null}
      </AnimatePresence>

      <ReasonLetter
        reason={selected}
        assets={assets}
        onClose={() => setSelected(null)}
      />
    </div>
  );

  if (bare) return body;

  return (
    <DayStage occasion={content.occasion} className="min-h-full w-full">
      {body}
    </DayStage>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";

import { TRIGGER_LABELS } from "../data/activities";
import { SEAT_COLORS } from "../lib/colors";
import { useLudoStore } from "../store";

export function ActivityModal() {
  const activity = useLudoStore((s) => s.activity);
  const players = useLudoStore((s) => s.players);
  const dismiss = useLudoStore((s) => s.dismissActivity);

  const player = activity
    ? players.find((p) => p.seat === activity.seat)
    : undefined;
  const color = player ? SEAT_COLORS[player.color] : null;
  const meta = activity ? TRIGGER_LABELS[activity.trigger] : null;

  return (
    <AnimatePresence>
      {activity && meta && (
        <motion.div
          className="absolute inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-[#2A1812]/45 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[26px] border border-[#F2DACE] bg-[#FFFBF7] p-6 text-center shadow-2xl"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-10 h-28 opacity-70"
              style={{
                background: color
                  ? `radial-gradient(ellipse 60% 100% at 50% 0%, ${color.soft}, transparent 70%)`
                  : undefined,
              }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
              className="relative mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full text-3xl"
              style={{
                background: color ? color.soft : "#FFF1E9",
                boxShadow: color ? `0 0 0 6px ${color.soft}55` : undefined,
              }}
            >
              {meta.emoji}
            </motion.div>

            <p className="text-xs font-semibold tracking-[0.18em] text-[#C75B39] uppercase">
              {meta.title}
            </p>
            <p className="mt-1 text-sm text-[#92786C]">
              <span
                className="font-semibold"
                style={{ color: color?.ink ?? "#3A2A25" }}
              >
                {player?.name ?? "Someone"}
              </span>{" "}
              drew a couple card
            </p>

            <p className="mt-4 font-display text-xl leading-snug text-[#3A2A25]">
              {activity.text}
            </p>

            <button
              type="button"
              onClick={dismiss}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-sm font-medium text-white kyndl-glow-warm transition-transform hover:-translate-y-0.5"
            >
              Done — keep playing
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="mt-2 text-xs text-[#A98E80] hover:text-[#7A6258]"
            >
              Skip this one
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

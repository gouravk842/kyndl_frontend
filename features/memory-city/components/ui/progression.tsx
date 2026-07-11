"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Stars } from "lucide-react";
import { useEffect, useState } from "react";

import { nodeTitle } from "../../lib/node-visuals";
import { useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";

/**
 * A transient "memory recalled — X of N" toast that flashes top-centre each time
 * a reward is revealed, so progress feels earned even though the reveal panel
 * sits to the side.
 */
export function CollectedToast({ city }: { city: CityConfig }) {
  const lastRecalledId = useMemoryCityStore((s) => s.lastRecalledId);
  const count = useMemoryCityStore((s) => s.recalled.size);
  // The toast hides itself once `hiddenId` catches up to the latest recall;
  // state is only set inside the timer callback (never synchronously here).
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastRecalledId) return;
    const t = window.setTimeout(() => setHiddenId(lastRecalledId), 2600);
    return () => window.clearTimeout(t);
  }, [lastRecalledId]);

  const visibleId =
    lastRecalledId && lastRecalledId !== hiddenId ? lastRecalledId : null;
  const node = visibleId ? city.nodes.find((n) => n.id === visibleId) : null;

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={visibleId}
          className="pointer-events-none absolute inset-x-0 top-20 z-30 flex justify-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="flex items-center gap-2 rounded-full border border-[#7fd9ff]/30 bg-black/55 px-4 py-2 text-sm text-white shadow-[0_0_24px_rgba(127,217,255,0.35)] backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#7fd9ff]" />
            <span className="font-semibold">Memory recalled</span>
            <span className="text-white/55">
              {count} of {city.nodes.length} · {nodeTitle(node)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The finale. Once every memory in the city has been recalled, a warm overlay
 * marks the moment and credits the gift. Dismissable so the recipient can keep
 * wandering the now fully-lit city.
 */
export function CityFinale({ city }: { city: CityConfig }) {
  const started = useMemoryCityStore((s) => s.started);
  const count = useMemoryCityStore((s) => s.recalled.size);
  const activeNodeId = useMemoryCityStore((s) => s.activeNodeId);
  const [dismissed, setDismissed] = useState(false);

  const complete =
    started && count === city.nodes.length && city.nodes.length > 0;

  return (
    <AnimatePresence>
      {complete && !dismissed && !activeNodeId && (
        <motion.div
          className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-black/55 via-black/45 to-black/70 px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="flex flex-col items-center"
          >
            <Stars className="mb-4 h-10 w-10 text-[#7fd9ff]" />
            <h2 className="font-display text-4xl text-white drop-shadow-lg sm:text-5xl">
              Every memory recalled
            </h2>
            <p className="mt-4 max-w-md text-sm text-white/75 sm:text-base">
              All {city.nodes.length} lights of {city.title} are lit. The city
              is yours to wander now.
            </p>
            {(city.from || city.to) && (
              <p className="mt-4 text-xs tracking-[0.2em] text-white/45 uppercase">
                {city.to ? `For ${city.to}` : ""}
                {city.from && city.to ? " · " : ""}
                {city.from ? `From ${city.from}` : ""}
              </p>
            )}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-[#7fd9ff] px-8 text-sm font-semibold text-[#0b0a1a] shadow-[0_0_30px_rgba(127,217,255,0.5)] transition-transform hover:scale-105"
            >
              Wander again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

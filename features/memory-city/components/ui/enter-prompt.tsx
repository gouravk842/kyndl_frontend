import { AnimatePresence, motion } from "framer-motion";

import { useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";

/**
 * The threshold. Shown over the slow attract-orbit until the recipient steps in;
 * the click both starts the tour and unlocks audio (browser autoplay policy).
 */
export function EnterPrompt({
  city,
  onEnter,
}: {
  city: CityConfig;
  onEnter: () => void;
}) {
  const started = useMemoryCityStore((s) => s.started);

  return (
    <AnimatePresence>
      {!started && (
        <motion.div
          key="enter"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-black/40 via-black/30 to-black/60 px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {city.to && (
            <p className="mb-3 text-xs tracking-[0.32em] text-white/60 uppercase">
              For {city.to}
            </p>
          )}
          <h1 className="font-display text-4xl text-white drop-shadow-lg sm:text-6xl">
            {city.title}
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
            A city of your memories. Revolve through it, stop where you like,
            and recall each one.
          </p>
          <button
            type="button"
            onClick={onEnter}
            className="mt-8 inline-flex h-12 items-center rounded-full bg-[#7fd9ff] px-8 text-sm font-semibold text-[#0b0a1a] shadow-[0_0_30px_rgba(127,217,255,0.5)] transition-transform hover:scale-105"
          >
            Step into the city
          </button>
          {city.from && (
            <p className="mt-6 text-xs text-white/40">From {city.from}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

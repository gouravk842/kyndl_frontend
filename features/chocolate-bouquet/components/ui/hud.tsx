"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { BouquetConfig } from "../../config";
import { useBouquetStore } from "../../store";

/**
 * The frame around the bouquet — the name up top, and either the read-count or
 * the closing message along the bottom. Non-interactive; taps fall through to
 * the chocolates beneath.
 */
export function Hud({ config }: { config: BouquetConfig }) {
  const openedCount = useBouquetStore((s) => s.openedIds.size);
  const selectedId = useBouquetStore((s) => s.selectedId);
  const total = config.chocolates.length;
  const allOpened = total > 0 && openedCount >= total;
  const visible = selectedId == null;

  return (
    <>
      <motion.header
        className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[max(1.6rem,env(safe-area-inset-top))] text-center"
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -8 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-2xl text-[#fbeede] sm:text-3xl [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
          {config.bouquetName}
        </h1>
        {config.subtitle ? (
          <p className="mt-1 font-serif text-sm text-[#e6b9ae] [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
            {config.subtitle}
          </p>
        ) : null}
      </motion.header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[max(1.6rem,env(safe-area-inset-bottom))] text-center">
        <AnimatePresence mode="wait">
          {allOpened ? (
            <motion.p
              key="finale"
              className="max-w-md font-serif text-base leading-relaxed text-[#f6ead3] [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: visible ? 1 : 0, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {config.allOpenedMessage}
            </motion.p>
          ) : (
            <motion.p
              key="progress"
              className="text-xs font-medium uppercase tracking-[0.22em] text-[#d3a79e]"
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {openedCount} of {total} unwrapped
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

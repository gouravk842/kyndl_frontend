"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Lock } from "lucide-react";
import { useEffect } from "react";

/**
 * The shared 18+ consent prompt for the Red Zone section. Used both when
 * entering from the header and on the section page itself. Confirming is the
 * caller's job (it records consent and proceeds); cancelling just closes.
 */
export function AgeConsentDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="red-zone-consent-title"
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-white/10 bg-[#160913] px-7 py-9 text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
              <Lock className="size-6" />
            </span>
            <div className="space-y-2">
              <h2
                id="red-zone-consent-title"
                className="font-display text-2xl text-white"
              >
                Entering the Red Zone
              </h2>
              <p className="text-sm leading-relaxed text-white/55">
                This is an adults-only space for couples. By continuing you
                confirm you{"'"}re 18 or older and happy to see intimate,
                grown-up content.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Flame className="size-4" /> I{"'"}m 18 or older — enter
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-7 py-2.5 text-sm font-medium text-white/50 transition-colors hover:text-white/80"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

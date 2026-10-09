"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function CalmPopup({
  open,
  onClose,
  children,
  className,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          data-hud
          className="fixed inset-0 z-50 flex items-end justify-center p-0 md:items-center md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22, ease }}
          onWheel={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#3A2A25]/28"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 28, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: reduce ? 0 : 0.34, ease }}
            className={cn(
              "relative z-10 flex w-full max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl border border-[var(--mb-solar-line,var(--border))] bg-[var(--mb-solar-void,var(--card))] shadow-[0_24px_60px_rgba(58,42,37,0.18)] md:max-h-[min(88dvh,42rem)] md:max-w-lg md:rounded-3xl",
              className,
            )}
            onClick={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

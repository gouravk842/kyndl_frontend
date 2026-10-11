"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

const LOADER_KEY = "kyndl-loader-seen";
/** Logo animation (~1s) plus a short brand hold — never a multi-second gate. */
const LOADER_DURATION_MS = 1100;

interface PageLoaderProps {
  intro: ReactNode;
}

export function PageLoader({ intro }: PageLoaderProps) {
  const [visible, setVisible] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(LOADER_KEY)) return;

    // Defer setState out of the effect body (async) so return visits never
    // mount an overlay, while first visits still get the brand intro.
    const showTimer = window.setTimeout(() => {
      setVisible(true);
      setPlayKey((k) => k + 1);
    }, 0);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(LOADER_KEY, "1");
    }, LOADER_DURATION_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090909]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
          aria-label="Loading Kyndl"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, #F0A13D 0%, #FF7A59 35%, transparent 70%)",
            }}
            aria-hidden
          />
          <div key={playKey}>{intro}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

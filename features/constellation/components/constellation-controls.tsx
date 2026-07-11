"use client";

import { AnimatePresence, motion } from "framer-motion";

type ConstellationControlsProps = {
  tourEnabled: boolean;
  touring: boolean;
  tourPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onExplore: () => void;
  soundEnabled: boolean;
  muted: boolean;
  onToggleMute: () => void;
};

const pill =
  "pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-xs font-medium tracking-[0.16em] text-[#e8e2f4] uppercase backdrop-blur-sm outline-none transition-colors hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-[#f3ead2]/70";

/**
 * The lean control surface: a play/pause pill for the cinematic tour and a mute
 * toggle. Kept minimal so it never competes with the sky — it fades in only
 * once the constellation has finished assembling.
 */
export function ConstellationControls({
  tourEnabled,
  touring,
  tourPaused,
  onPlay,
  onPause,
  onResume,
  onExplore,
  soundEnabled,
  muted,
  onToggleMute,
}: ConstellationControlsProps) {
  return (
    <>
      {soundEnabled ? (
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={!muted}
          className="pointer-events-auto absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-[#e8e2f4] backdrop-blur-sm outline-none transition-colors hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-[#f3ead2]/70"
        >
          {muted ? <IconMuted /> : <IconSound />}
        </button>
      ) : null}

      {tourEnabled ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-50 flex items-center justify-center gap-3">
          <AnimatePresence mode="wait">
            {touring ? (
              <motion.div
                key="touring"
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={tourPaused ? onResume : onPause}
                  className={pill}
                >
                  {tourPaused ? <IconPlay /> : <IconPause />}
                  {tourPaused ? "Resume" : "Pause"}
                </button>
                <button type="button" onClick={onExplore} className={pill}>
                  Explore it yourself
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="play"
                type="button"
                onClick={onPlay}
                className={pill}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
              >
                <IconPlay />
                Play our story
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </>
  );
}

function IconPlay() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function IconSound() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
    </svg>
  );
}

function IconMuted() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M3 9v6h4l5 5V4L7 9H3zm18.3-1.3-1.4-1.4L17 9.2 14.1 6.3l-1.4 1.4L15.6 10.6 12.7 13.5l1.4 1.4L17 12l2.9 2.9 1.4-1.4L18.4 10.6z" />
    </svg>
  );
}

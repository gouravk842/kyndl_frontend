"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useMounted } from "@/hooks/use-mounted";

import {
  themeFor,
  TIME_CAPSULE_CONFIG,
  type TimeCapsuleConfig,
} from "../config";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

/** Break a millisecond gap into whole d/h/m/s (never negative). */
function partsFor(ms: number): Parts {
  const clamped = Math.max(0, ms);
  const seconds = Math.floor(clamped / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

function formatUnlockDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function TimeCapsuleExperience({
  config = TIME_CAPSULE_CONFIG,
  assets = {},
  forceOpen = false,
  playMusic = true,
  className,
}: {
  config?: TimeCapsuleConfig;
  assets?: Record<string, string>;
  /** Preview the opened capsule regardless of the unlock date. */
  forceOpen?: boolean;
  playMusic?: boolean;
  className?: string;
}) {
  const theme = themeFor(config.theme);
  const mounted = useMounted();

  const target = useMemo(
    () => new Date(config.unlockDate).getTime(),
    [config.unlockDate],
  );

  const [now, setNow] = useState(() => Date.now());
  const reached = !Number.isNaN(target) && now >= target;
  // Before mount we render the sealed shell (no live digits) to avoid a
  // hydration mismatch; after mount the clock ticks and can auto-open at zero.
  const open = forceOpen || (mounted && reached);

  useEffect(() => {
    if (open) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const music = config.music ? assets[config.music.fileId] : undefined;
  const photos = config.photos
    .map((p) => assets[p.fileId])
    .filter((u): u is string => Boolean(u));

  return (
    <div
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ background: theme.background }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10%] left-1/2 h-[70vh] w-[70vh] -translate-x-1/2"
        style={{ background: theme.glow }}
      />

      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-5 py-8 md:py-16">
        <AnimatePresence mode="wait">
          {open ? (
            <OpenedCapsule
              key="open"
              config={config}
              theme={theme}
              photos={photos}
              music={playMusic ? music : undefined}
            />
          ) : (
            <SealedCapsule
              key="sealed"
              config={config}
              theme={theme}
              parts={partsFor(target - now)}
              mounted={mounted}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sealed state ───────────────────────────────────────────────────
function SealedCapsule({
  config,
  theme,
  parts,
  mounted,
}: {
  config: TimeCapsuleConfig;
  theme: ReturnType<typeof themeFor>;
  parts: Parts;
  mounted: boolean;
}) {
  const textOnDark = theme.dark ? "text-white" : "text-[#3a2a25]";
  const subOnDark = theme.dark ? "text-white/70" : "text-[#7a6258]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex w-full flex-col items-center text-center"
    >
      <p
        className="text-xs font-semibold tracking-[0.25em] uppercase"
        style={{ color: theme.accent }}
      >
        Sealed capsule
      </p>
      <h1 className={`mt-2 font-display text-3xl sm:text-4xl ${textOnDark}`}>
        {config.title}
      </h1>
      {config.recipientName.trim() && (
        <p className={`mt-1 text-sm ${subOnDark}`}>
          for {config.recipientName}
        </p>
      )}

      {/* The capsule */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative my-9 grid h-44 w-44 place-items-center rounded-[2.2rem] shadow-2xl"
        style={{ background: theme.shell, border: `3px solid ${theme.rim}` }}
      >
        {/* seam */}
        <span
          aria-hidden
          className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2"
          style={{ background: theme.rim, opacity: 0.55 }}
        />
        {/* wax seal / lock */}
        <span
          className="grid size-16 place-items-center rounded-full shadow-inner"
          style={{ background: theme.accent }}
        >
          <Lock className="size-7 text-white/95" />
        </span>
      </motion.div>

      {config.teaser.trim() && (
        <p className={`max-w-md text-sm leading-relaxed ${subOnDark}`}>
          {config.teaser}
        </p>
      )}

      {/* Countdown */}
      <div className="mt-8 flex items-end gap-3 sm:gap-5">
        {(
          [
            ["days", parts.days],
            ["hours", parts.hours],
            ["mins", parts.minutes],
            ["secs", parts.seconds],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex flex-col items-center">
            <span
              className={`font-display text-4xl tabular-nums sm:text-5xl ${textOnDark}`}
            >
              {mounted ? String(value).padStart(2, "0") : "––"}
            </span>
            <span
              className={`mt-1 text-[11px] tracking-widest uppercase ${subOnDark}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className={`mt-8 text-xs ${subOnDark}`}>
        Opens on {formatUnlockDate(config.unlockDate)}
        {config.senderName.trim() ? ` · sealed by ${config.senderName}` : ""}
      </p>
    </motion.div>
  );
}

// ── Opened state ───────────────────────────────────────────────────
function OpenedCapsule({
  config,
  theme,
  photos,
  music,
}: {
  config: TimeCapsuleConfig;
  theme: ReturnType<typeof themeFor>;
  photos: string[];
  music?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <div className="mb-4 flex items-center justify-center gap-2">
        <Sparkles className="size-4" style={{ color: theme.accent }} />
        <p
          className="text-xs font-semibold tracking-[0.25em] uppercase"
          style={{ color: theme.accent }}
        >
          The capsule is open
        </p>
      </div>

      {/* Letter */}
      <article
        className="mx-auto max-w-xl rounded-2xl px-6 py-8 shadow-2xl sm:px-10 sm:py-12"
        style={{ background: theme.paper, color: theme.ink }}
      >
        <h1 className="font-display text-2xl sm:text-3xl">{config.title}</h1>
        {config.letter.greeting.trim() && (
          <p className="mt-6 text-base font-medium">{config.letter.greeting}</p>
        )}
        {config.letter.body.trim() && (
          <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line opacity-90">
            {config.letter.body}
          </p>
        )}
        {config.letter.signoff.trim() && (
          <p className="mt-6 text-base font-medium">{config.letter.signoff}</p>
        )}
        {config.senderName.trim() && (
          <p className="mt-1 font-display text-xl">{config.senderName}</p>
        )}

        {photos.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {photos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
              <img
                key={i}
                src={url}
                alt=""
                className="aspect-[4/3] w-full rounded-xl object-cover shadow-sm"
              />
            ))}
          </div>
        )}
      </article>

      {music && <audio src={music} autoPlay loop className="sr-only" />}
    </motion.div>
  );
}

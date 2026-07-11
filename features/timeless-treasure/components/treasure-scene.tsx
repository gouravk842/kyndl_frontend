"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ReelFrame, Tag, TreasureTheme } from "../config";
import { KeepsakeTag } from "./keepsake-tag";

/** Advance interval for autoplay, in ms. */
const AUTOPLAY_MS = 2800;

/** The 3D pose a panel takes given its distance from the active one. */
type Pose = {
  y: number;
  z: number;
  scale: number;
  rotateX: number;
  opacity: number;
  blur: number;
  zIndex: number;
};

/**
 * Where a panel sits relative to the hero. Upcoming panels (offset > 0) peek up
 * out of the box below; the active panel (0) locks flat at eye level; viewed
 * panels (offset < 0) fold up and stack toward the top, receding with
 * depth-of-field blur so the focus stays unmistakable.
 */
function poseFor(offset: number): Pose {
  if (offset === 0) {
    return { y: 0, z: 80, scale: 1, rotateX: 0, opacity: 1, blur: 0, zIndex: 60 };
  }
  if (offset > 0) {
    // still emerging from the box
    if (offset === 1)
      return { y: 118, z: -40, scale: 0.82, rotateX: 34, opacity: 0.9, blur: 1.5, zIndex: 45 };
    if (offset === 2)
      return { y: 172, z: -110, scale: 0.64, rotateX: 46, opacity: 0.4, blur: 3, zIndex: 35 };
    return { y: 200, z: -160, scale: 0.56, rotateX: 52, opacity: 0, blur: 4, zIndex: 25 };
  }
  // already viewed — folded up top, stacking back
  const a = Math.min(-offset, 4);
  return {
    y: -104 - (a - 1) * 30,
    z: -50 - (a - 1) * 34,
    scale: 0.82 - (a - 1) * 0.05,
    rotateX: -(40 + (a - 1) * 6),
    opacity: a === 1 ? 0.72 : a === 2 ? 0.44 : a === 3 ? 0.22 : 0.08,
    blur: Math.min(1.5 + (a - 1) * 1.6, 6),
    zIndex: 44 - a,
  };
}

/** A single cardstock print — a matte-framed photo taped to heavy paper. */
function PhotoCard({
  url,
  caption,
  date,
  theme,
  isHero,
  tilt,
  reduceMotion,
}: {
  url: string | null;
  caption: string;
  date: string;
  theme: TreasureTheme;
  isHero: boolean;
  tilt: number;
  reduceMotion: boolean | null;
}) {
  return (
    <div
      className="relative w-[248px] rounded-[4px] p-2.5 pb-3 sm:w-[268px]"
      style={{
        background: theme.paper,
        transform: `rotate(${tilt}deg)`,
        boxShadow: isHero
          ? "0 30px 55px -20px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.2)"
          : "0 16px 30px -18px rgba(0,0,0,0.5)",
      }}
    >
      {/* paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[4px] opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* tape */}
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rounded-[1px] bg-white/40 shadow-sm backdrop-blur-[1px]"
      />

      <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-black/5">
        {url ? (
          <motion.img
             
            src={url}
            alt={caption || ""}
            className="h-full w-full object-cover"
            initial={false}
            animate={reduceMotion ? undefined : { scale: isHero ? 1.08 : 1 }}
            transition={{ duration: isHero ? 6 : 0.6, ease: "easeOut" }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-black/[0.04]">
            <span className="text-[10px] tracking-[0.3em] text-black/30 uppercase">
              photo
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 24px rgba(0,0,0,0.14)" }}
        />
      </div>

      <div className="relative mt-2 h-5 text-center">
        {caption && (
          <p
            className="font-hand truncate text-[17px] leading-none"
            style={{ color: theme.ink }}
          >
            {caption}
          </p>
        )}
        {!caption && date && (
          <p
            className="text-[10px] font-semibold tracking-[0.24em] uppercase"
            style={{ color: theme.ink, opacity: 0.55 }}
          >
            {date}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The keepsake box + its fixed-height reel stage.
 *
 * Closed, the lid caps the box at centre — tap it. On open the lid lifts to the
 * top and the photos rise out of the box one at a time into a hero focus, viewed
 * ones folding up and stacking back. It never grows the page: the reel is a
 * fixed stage you drive with the transport controls (prev · play/pause · next)
 * or let autoplay run. All layered 2.5D transforms, not WebGL.
 */
export function TreasureScene({
  open,
  onOpen,
  theme,
  tag,
  senderName,
  recipientName,
  frames,
  urlFor,
}: {
  open: boolean;
  onOpen: () => void;
  theme: TreasureTheme;
  tag: Tag;
  senderName: string;
  recipientName: string;
  frames: ReelFrame[];
  urlFor: (frame: ReelFrame) => string | null;
}) {
  const reduceMotion = useReducedMotion();

  // Placeholder panels so the closed→open flow still reads with no photos yet.
  const shown: ReelFrame[] = useMemo(
    () =>
      frames.length
        ? frames
        : Array.from({ length: 5 }, (_, i) => ({
            id: `ph-${i}`,
            fileId: "",
            caption: "",
            date: "",
          })),
    [frames],
  );
  const count = shown.length;

  const [active, setActive] = useState(0);
  // Autoplay is on by default; it only actually advances once the box is open.
  const [playing, setPlaying] = useState(true);
  const atEnd = active >= count - 1;

  // Autoplay: while open + playing, advance a frame at a time up to the last.
  // The state update lives in the timeout callback (not the effect body), and
  // the effect simply stops scheduling once the reel reaches its end.
  useEffect(() => {
    if (!open || !playing || atEnd) return;
    const t = setTimeout(
      () => setActive((a) => Math.min(a + 1, count - 1)),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(t);
  }, [open, playing, active, atEnd, count]);

  const go = useCallback(
    (dir: -1 | 1) => {
      setPlaying(false);
      setActive((a) => Math.min(count - 1, Math.max(0, a + dir)));
    },
    [count],
  );

  const togglePlay = useCallback(() => {
    if (atEnd) {
      setActive(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [atEnd]);

  const activeFrame = shown[active];

  return (
    <div className="flex w-full flex-col items-center">
      {/* THE STAGE — fixed height; the reel lives entirely inside it. */}
      <div
        className="relative h-[520px] w-full max-w-md sm:h-[560px]"
        style={{ perspective: 1300 }}
      >
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ambient spotlight behind the hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[38%] left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: theme.glow, opacity: open ? 0.9 : 0.35 }}
          />

          {/* THE LID — caps the box when closed; flies to the top on open. */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 z-[55]"
            style={{
              width: 250,
              transformStyle: "preserve-3d",
              transformOrigin: "center bottom",
            }}
            initial={false}
            animate={
              open
                ? { top: "3%", x: "-50%", y: 0, rotateX: -60, opacity: 0.9 }
                : reduceMotion
                  ? { top: "auto", bottom: 128, x: "-50%", rotateX: 0 }
                  : { top: "auto", bottom: 128, x: "-50%", rotateX: 0 }
            }
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative h-12 rounded-lg"
              style={{
                background: theme.boxLid,
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.22), 0 10px 20px -8px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="absolute inset-0 rounded-lg"
                style={{ border: `2px solid ${theme.metal}`, opacity: 0.5 }}
              />
            </div>
          </motion.div>

          {/* THE PANELS — absolutely centred, posed by distance from active. */}
          {open &&
            shown.map((frame, i) => {
              const offset = i - active;
              const pose = poseFor(offset);
              const tilt = offset === 0 ? 0 : offset % 2 === 0 ? -1.5 : 1.5;
              return (
                <div
                  key={frame.id}
                  className="absolute top-[38%] left-1/2"
                  style={{
                    transform: "translate(-50%, -50%)",
                    transformStyle: "preserve-3d",
                    zIndex: pose.zIndex,
                  }}
                >
                  <motion.div
                    style={{ transformStyle: "preserve-3d" }}
                    initial={false}
                    animate={{
                      y: pose.y,
                      z: pose.z,
                      scale: pose.scale,
                      rotateX: pose.rotateX,
                      opacity: pose.opacity,
                      filter: `blur(${pose.blur}px)`,
                    }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <PhotoCard
                      url={frame.fileId ? urlFor(frame) : null}
                      caption={frame.caption}
                      date={frame.date}
                      theme={theme}
                      isHero={offset === 0}
                      tilt={tilt}
                      reduceMotion={reduceMotion}
                    />
                  </motion.div>
                </div>
              );
            })}

          {/* THE BOX BASE — anchored at the bottom; photos rise out of it. */}
          <button
            type="button"
            onClick={open ? undefined : onOpen}
            disabled={open}
            aria-label={open ? "The treasure is open" : "Open the treasure"}
            className="absolute bottom-0 left-1/2 z-50 block w-[300px] -translate-x-1/2 cursor-pointer outline-none disabled:cursor-default"
          >
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
              {/* dark interior lip */}
              <div
                className="absolute inset-x-2 -top-3 z-0 h-24 rounded-b-lg rounded-t-sm"
                style={{ background: theme.boxInner }}
              />
              {/* front wall + nameplate */}
              <motion.div
                className="relative z-[1] h-28 rounded-b-lg rounded-t-sm"
                style={{
                  background: theme.boxBody,
                  boxShadow:
                    "inset 0 2px 6px rgba(255,255,255,0.14), inset 0 -8px 16px rgba(0,0,0,0.4)",
                }}
                animate={
                  open || reduceMotion ? undefined : { y: [0, -4, 0] }
                }
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="absolute inset-0 rounded-b-lg rounded-t-sm"
                  style={{ border: `2px solid ${theme.metal}`, opacity: 0.5 }}
                />
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
                  <KeepsakeTag
                    tag={tag}
                    senderName={senderName}
                    recipientName={recipientName}
                    theme={theme}
                    compact
                  />
                </div>
              </motion.div>
            </div>
          </button>

          {/* counter, top-right */}
          {open && count > 1 && (
            <div
              className="absolute top-2 right-2 z-[70] rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] tabular-nums"
              style={{
                color: theme.ink,
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(6px)",
              }}
            >
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </div>
          )}
        </div>
      </div>

      {/* Tap-to-open hint (closed only). */}
      {!open && (
        <motion.p
          className="mt-5 flex items-center gap-1.5 text-sm font-medium"
          style={{ color: theme.dark ? "#eee6da" : theme.ink }}
          animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="size-4" style={{ color: theme.accent }} />
          Tap to unfold your memories
        </motion.p>
      )}

      {/* TRANSPORT — prev · play/pause · next, with a progress track. */}
      {open && count > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex w-full max-w-[300px] flex-col items-center gap-3"
        >
          <div
            className="flex items-center gap-2 rounded-full p-1.5 shadow-lg"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.paperEdge}`,
            }}
          >
            <CtrlButton
              label="Previous"
              theme={theme}
              disabled={active === 0}
              onClick={() => go(-1)}
            >
              <ChevronLeft className="size-5" />
            </CtrlButton>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing && !atEnd ? "Pause" : atEnd ? "Replay" : "Play"}
              className="grid size-11 place-items-center rounded-full text-white shadow-md transition-transform hover:scale-105"
              style={{ background: theme.accent }}
            >
              {playing && !atEnd ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5 translate-x-[1px]" />
              )}
            </button>
            <CtrlButton
              label="Next"
              theme={theme}
              disabled={atEnd}
              onClick={() => go(1)}
            >
              <ChevronRight className="size-5" />
            </CtrlButton>
          </div>

          {/* progress track */}
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ background: theme.paperEdge }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: theme.accent }}
              animate={{ width: `${((active + 1) / count) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* active caption line (echoes the hero card, larger) */}
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="min-h-[1.25rem] text-center text-sm"
              style={{ color: theme.ink }}
            >
              {activeFrame?.date && (
                <span className="mr-2 text-xs font-semibold tracking-[0.2em] uppercase opacity-60">
                  {activeFrame.date}
                </span>
              )}
              {activeFrame?.caption}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function CtrlButton({
  children,
  label,
  onClick,
  disabled,
  theme,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  theme: TreasureTheme;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full transition-colors hover:bg-black/5 disabled:opacity-30"
      style={{ color: theme.ink }}
    >
      {children}
    </button>
  );
}

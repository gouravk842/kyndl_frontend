"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useCallback } from "react";

import type {
  Letter,
  ReelFrame,
  SceneTokens,
  Tag,
  TreasureTheme,
} from "../config";
import { MemoryRibbon } from "./memory-ribbon";

/** Noise texture, reused for leather + paper grain. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * The keepsake album. Closed, it's a leather-bound cover resting on linen —
 * embossed in gold with the dedication and the recipient's name, a stitched
 * border, and a leather pocket with a pull-strap hanging from it. Drag the strap
 * down (or tap it) and the album opens: the strip of memories unspools out of
 * the pocket as a concertina, developing photo by photo, down to the printed
 * dedication at its end.
 *
 * Inspired by a real leather photo-album with a fan-folded photo-strip tucked
 * into a pocket — rebuilt in layered 2.5D CSS, never WebGL.
 */
export function KeepsakeAlbum({
  open,
  onOpen,
  onClose,
  theme,
  scene,
  tag,
  letter,
  senderName,
  recipientName,
  frames,
  urlFor,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  theme: TreasureTheme;
  scene: SceneTokens;
  tag: Tag;
  letter: Letter;
  senderName: string;
  recipientName: string;
  frames: ReelFrame[];
  urlFor: (frame: ReelFrame) => string | null;
}) {
  const reduceMotion = useReducedMotion();
  const recipient = recipientName.trim();
  const title = tag.title.trim() || "Made of Happy Memories";

  const onStrapDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      if (info.offset.y > 52) onOpen();
    },
    [onOpen],
  );

  return (
    <div className="flex w-full max-w-md flex-col items-center px-3 sm:px-0">
      <AnimatePresence mode="wait">
        {!open ? (
          /* ─────────────────────────── CLOSED COVER ─────────────────────── */
          <motion.div
            key="cover"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -18, scale: 0.98 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col items-center"
          >
            <motion.div
              className="relative w-[min(100%,320px)] rounded-[14px] px-6 pt-10 pb-8 sm:w-[356px] sm:px-7"
              style={{
                background: scene.leather,
                boxShadow:
                  "0 30px 60px -30px rgba(30,20,8,0.45), 0 6px 16px -10px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.22)",
              }}
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -5, 0], rotate: [-0.3, 0.3, -0.3] }
              }
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* leather grain */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[14px] opacity-[0.08] mix-blend-soft-light"
                style={{ backgroundImage: GRAIN }}
              />
              {/* soft top sheen — a clean, modern catch of light */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[14px]"
                style={{
                  background:
                    "linear-gradient(155deg, rgba(255,255,255,0.16) 0%, transparent 32%)",
                }}
              />
              {/* stitched border */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[10px] rounded-[9px]"
                style={{
                  border: `1.5px dashed ${scene.stitch}`,
                  opacity: 0.55,
                }}
              />
              {/* leather corner mounts */}
              {[
                "top-2 left-2",
                "top-2 right-2 rotate-90",
                "bottom-2 left-2 -rotate-90",
                "bottom-2 right-2 rotate-180",
              ].map((pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`absolute ${pos} h-6 w-6 rounded-tl-[10px]`}
                  style={{
                    borderTop: `3px solid ${scene.foil}`,
                    borderLeft: `3px solid ${scene.foil}`,
                    opacity: 0.35,
                  }}
                />
              ))}

              {/* dedication, embossed in foil */}
              <div className="relative text-center">
                {recipient && (
                  <p
                    className="text-[10px] font-semibold tracking-[0.4em] uppercase"
                    style={{ color: scene.foil, opacity: 0.7 }}
                  >
                    A keepsake for
                  </p>
                )}
                {recipient && (
                  <p
                    className="font-cursive mt-1 text-3xl sm:text-4xl"
                    style={{
                      color: scene.foil,
                      textShadow: "0 1px 1px rgba(0,0,0,0.4)",
                    }}
                  >
                    {recipient}
                  </p>
                )}
              </div>

              {/* the pocket band + embossed title */}
              <div
                className="relative mt-7 flex h-16 items-center justify-center rounded-[6px] px-4"
                style={{
                  background: scene.leatherDark,
                  boxShadow: `inset 0 2px 5px rgba(0,0,0,0.5), inset 0 1px 0 ${scene.leatherSheen}, 0 2px 0 rgba(255,255,255,0.05)`,
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 top-0 h-3 -translate-y-full rounded-t-[4px]"
                  style={{
                    background: `linear-gradient(to top, ${scene.pocketShadow}, transparent)`,
                  }}
                />
                <p
                  className="font-cursive text-center text-[22px] leading-tight sm:text-2xl"
                  style={{
                    color: scene.foil,
                    textShadow: "0 1px 1px rgba(0,0,0,0.45)",
                  }}
                >
                  {title}
                </p>
              </div>

              {/* the pull-strap — drag it down (or tap) to open. The idle bob
                  lives on a wrapper so it never fights the drag/​snap-back on y. */}
              <motion.div
                className="relative mt-3 flex flex-col items-center"
                animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.button
                  type="button"
                  onClick={onOpen}
                  aria-label="Pull to open the album"
                  drag={reduceMotion ? false : "y"}
                  dragConstraints={{ top: 0, bottom: 96 }}
                  dragElastic={0.32}
                  dragSnapToOrigin
                  onDragEnd={onStrapDragEnd}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex h-[68px] w-14 cursor-grab touch-none flex-col items-center rounded-b-[20px] rounded-t-[4px] pt-2 outline-none active:cursor-grabbing"
                  style={{
                    background: scene.leatherDark,
                    boxShadow:
                      "0 14px 20px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  {/* stitched edge */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-1.5 top-1.5 bottom-2 rounded-b-[16px] rounded-t-[3px]"
                    style={{
                      border: `1px dashed ${scene.stitch}`,
                      opacity: 0.5,
                    }}
                  />
                  {/* brass stud */}
                  <span
                    aria-hidden
                    className="mt-auto mb-3 block size-4 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${scene.foil}, ${theme.metal})`,
                      boxShadow:
                        "0 1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.6)",
                    }}
                  />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* invite */}
            <motion.p
              className="mt-6 flex max-w-[min(100%,20rem)] items-center justify-center gap-1.5 px-4 text-center text-sm font-medium"
              style={{ color: theme.dark ? "#efe7db" : theme.ink }}
              animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Pull the strap to unfold your memories
              <ChevronDown className="size-4" style={{ color: theme.accent }} />
            </motion.p>
          </motion.div>
        ) : (
          /* ─────────────────────────── OPEN ALBUM ───────────────────────── */
          <motion.div
            key="album"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex w-full flex-col items-center"
          >
            {/* persistent leather nameplate header */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[min(100%,272px)] rounded-[10px] px-5 py-4 text-center sm:w-[300px] sm:px-6"
              style={{
                background: scene.leather,
                boxShadow:
                  "0 18px 34px -24px rgba(30,20,8,0.42), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[10px] opacity-[0.08] mix-blend-soft-light"
                style={{ backgroundImage: GRAIN }}
              />
              <p
                className="font-cursive text-2xl"
                style={{
                  color: scene.foil,
                  textShadow: "0 1px 1px rgba(0,0,0,0.4)",
                }}
              >
                {title}
              </p>
              {recipient && (
                <p
                  className="mt-0.5 text-[10px] font-semibold tracking-[0.34em] uppercase"
                  style={{ color: scene.foil, opacity: 0.7 }}
                >
                  for {recipient}
                </p>
              )}
            </motion.div>

            <div className="mt-2">
              <MemoryRibbon
                frames={frames}
                urlFor={urlFor}
                theme={theme}
                scene={scene}
                tag={tag}
                letter={letter}
                senderName={senderName}
                recipientName={recipientName}
                reduceMotion={reduceMotion}
                onClose={onClose}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

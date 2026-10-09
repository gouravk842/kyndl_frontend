"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";

import {
  PLACEHOLDER_FRAMES,
  type ReelFrame,
  sceneFor,
  themeFor,
  TIMELESS_TREASURE_CONFIG,
  type TimelessTreasureConfig,
} from "@/features/timeless-treasure/config";
import { cn } from "@/lib/utils";

import { BackgroundMusic } from "./background-music";
import { SceneDecor } from "./scene-decor";
import { KeepsakeAlbum } from "./treasure-scene";

type TimelessTreasureExperienceProps = {
  config?: TimelessTreasureConfig;
  /** Resolved media URLs keyed by fileId (frames + music). */
  assets?: Record<string, string>;
  /** Whether to mount the looping music (off in the side-by-side builder). */
  playMusic?: boolean;
  /** Root min-height utility — overridden per host (page vs. builder pane). */
  className?: string;
  /** Start already opened (used by the builder so edits are always visible). */
  startOpen?: boolean;
};

/**
 * The live Timeless Treasure scene: a leather keepsake album the recipient opens
 * once. It rests on linen, embossed in gold; pull the strap and the pocket opens
 * onto a fixed stage where the memories are drawn out one card at a time — an
 * opening note, each photo (with the sender's lines pencilled beside it), and a
 * closing dedication. Self-themed from `config.theme`, so the public viewer
 * renders it with nothing but content + assets.
 */
export function TimelessTreasureExperience({
  config = TIMELESS_TREASURE_CONFIG,
  assets = {},
  playMusic = true,
  className = "min-h-dvh",
  startOpen = false,
}: TimelessTreasureExperienceProps) {
  const reduceMotion = useReducedMotion();
  const theme = themeFor(config.theme);
  const scene = sceneFor(config.theme);
  const [open, setOpen] = useState(startOpen);

  const urlFor = (frame: ReelFrame): string | null =>
    frame.fileId ? (assets[frame.fileId] ?? null) : null;

  const musicUrl = config.music ? (assets[config.music.fileId] ?? null) : null;

  // Fall back to gentle placeholder frames so the closed→open flow, the unfold
  // and the marketing page all read before the sender adds their own photos.
  const frames = config.frames.length ? config.frames : PLACEHOLDER_FRAMES;

  return (
    <div
      className={cn(
        "relative isolate flex w-full flex-col items-center overflow-hidden",
        className,
      )}
    >
      {/* linen surface the album lies on */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{ background: scene.linen }}
      />
      {/* woven linen texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${scene.linenWeave} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${scene.linenWeave} 0 1px, transparent 1px 3px)`,
        }}
      />
      {/* soft grain for tactility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* warm vignette so the album is the light in the room */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 62% 58% at 50% 34%, transparent 46%, rgba(40,28,12,0.1) 100%)",
        }}
      />

      {/* the keepsake spread the album rests in */}
      <SceneDecor theme={theme} scene={scene} reduceMotion={reduceMotion} />

      {/* the album + its pocket stage */}
      <div className="flex w-full max-w-2xl flex-col items-center px-4 py-14 sm:py-20">
        <KeepsakeAlbum
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          theme={theme}
          scene={scene}
          tag={config.tag}
          letter={config.letter}
          senderName={config.senderName}
          recipientName={config.recipientName}
          frames={frames}
          urlFor={urlFor}
        />
      </div>

      {open && playMusic && musicUrl ? (
        <BackgroundMusic src={musicUrl} />
      ) : null}
    </div>
  );
}

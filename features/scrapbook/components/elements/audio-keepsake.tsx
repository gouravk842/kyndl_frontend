"use client";

import { useEffect, useRef, useState } from "react";

import type { AudioPlayer } from "@/features/scrapbook/types";
import { cn } from "@/lib/utils";

type AudioKeepsakeProps = {
  title: string;
  src?: string;
  player?: AudioPlayer;
};

/**
 * An audio memory styled as a cassette tape or vinyl record. Click to play the
 * voice note or song; the reels / record spin while playing.
 */
export function AudioKeepsake({
  title,
  src,
  player = "cassette",
}: AudioKeepsakeProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const available = Boolean(src);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => setPlaying(false);
    el.addEventListener("ended", onEnd);
    return () => el.removeEventListener("ended", onEnd);
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el || !available) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="block cursor-pointer text-left disabled:cursor-default"
      disabled={!available}
      aria-label={
        available
          ? `${playing ? "Pause" : "Play"} ${title}`
          : `${title} — audio not added yet`
      }
    >
      {player === "vinyl" ? (
        <VinylRecord playing={playing} />
      ) : (
        <Cassette playing={playing} />
      )}
      <p className="mt-2 max-w-[12rem] font-hand text-base leading-tight text-[#5b4034]">
        {title}
        {!available && (
          <span className="block text-[11px] text-[#b29a89]">
            add {src ? src.split("/").pop() : "an audio clip"}
          </span>
        )}
      </p>
      {available && <audio ref={audioRef} src={src} preload="none" />}
    </button>
  );
}

function Cassette({ playing }: { playing: boolean }) {
  return (
    <div className="kyndl-pinned relative h-24 w-40 rounded-[6px] bg-[#3a2a25] p-2">
      <div className="flex h-12 items-center justify-around rounded-[3px] bg-[#52423b] px-3">
        {[0, 1].map((i) => (
          <span
            key={i}
            className={cn(
              "block h-7 w-7 rounded-full border-4 border-[#2a1d18] bg-[#d9c19a]",
              playing && "[animation:kyndl-vinyl-spin_1.4s_linear_infinite]",
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex h-6 items-center justify-center rounded-[2px] bg-[#f1e3cf]">
        <span className="font-hand text-xs text-[#7a5b3a]">
          {playing ? "▶ playing…" : "press play"}
        </span>
      </div>
    </div>
  );
}

function VinylRecord({ playing }: { playing: boolean }) {
  return (
    <div className="relative h-32 w-32">
      <div
        className={cn(
          "kyndl-pinned h-32 w-32 rounded-full bg-[radial-gradient(circle,#2a2320_0_18%,#15110f_18%_22%,#1e1815_22%_100%)]",
          playing && "[animation:kyndl-vinyl-spin_3s_linear_infinite]",
        )}
      >
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f2596f]" />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff7f1]" />
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

import type { VideoFrame } from "@/features/scrapbook/types";

import { AssetSlot } from "./asset-slot";

type VideoKeepsakeProps = {
  title: string;
  src?: string;
  poster?: string;
  frame?: VideoFrame;
};

/**
 * A video memory housed in a vintage TV (or photo frame). Click to play the
 * clip inside the screen; falls back to a slot until the video is added.
 */
export function VideoKeepsake({
  title,
  src,
  poster,
  frame = "tv",
}: VideoKeepsakeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const available = Boolean(src);
  const isTv = frame === "tv";

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <figure className="w-60">
      <div
        className={
          isTv
            ? "kyndl-pinned rounded-[18px] border-b-[10px] border-[#2a1d18] bg-[#5b4034] p-3 pb-5"
            : "kyndl-pinned rounded-[3px] bg-white p-2"
        }
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-black">
          {available ? (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              onClick={togglePlay}
              onEnded={() => setPlaying(false)}
              playsInline
              className="h-full w-full cursor-pointer object-cover"
            />
          ) : (
            <AssetSlot
              kind="video"
              hint={src ? src.split("/").pop() : poster?.split("/").pop()}
              className="rounded-none"
            />
          )}

          {/* CRT scanlines + glass curve */}
          {isTv && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.12)_0px,rgba(0,0,0,0.12)_1px,transparent_1px,transparent_3px)] mix-blend-overlay"
            />
          )}

          {available && !playing && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={`Play ${title}`}
              className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/15"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-xl text-[#3a2a25]">
                ▶
              </span>
            </button>
          )}
        </div>

        {isTv && (
          <div className="mt-2 flex items-center justify-end gap-1.5 pr-1">
            <span className="h-2 w-2 rounded-full bg-[#d9c19a]" />
            <span className="h-2 w-2 rounded-full bg-[#d9c19a]" />
          </div>
        )}
      </div>
      <figcaption className="mt-2 max-w-[14rem] font-hand text-base leading-tight text-[#5b4034]">
        {title}
      </figcaption>
    </figure>
  );
}

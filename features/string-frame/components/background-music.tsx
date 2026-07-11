"use client";

import { Music, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Loops the frame's track. Browsers block autoplay with sound, so we try to
 * start on mount and otherwise expose a small floating toggle the recipient can
 * tap. The `src` is a presigned/object URL resolved from the `music` ref.
 */
export function BackgroundMusic({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        className="fixed right-5 bottom-5 z-[80] grid size-11 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/65"
      >
        {playing ? (
          <Music className="size-5 animate-pulse" />
        ) : (
          <VolumeX className="size-5" />
        )}
      </button>
    </>
  );
}

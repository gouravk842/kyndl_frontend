"use client";

import { Music, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Loops a track once the reveal opens. Browsers block autoplay with sound, so we
 * try to start on mount and otherwise expose a small floating toggle the user
 * can tap. The `src` is a presigned/object URL resolved from the `music` ref.
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
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[95] grid size-10 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/65 sm:right-5 sm:bottom-5 sm:left-auto sm:size-11"
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

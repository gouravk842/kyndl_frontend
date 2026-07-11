"use client";

import { Music, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Loops a background track while the jar is open. Browsers block autoplay with
 * sound, so we try to start on mount and otherwise expose a small floating
 * toggle the user can tap to play/pause. The `src` is a presigned/object URL
 * resolved from the jar's `music` reference.
 */
export function BackgroundMusic({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // Attempt to start playback on mount; stays paused if the browser blocks it.
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
      void audio.play().then(() => setPlaying(true)).catch(() => {});
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
        className="fixed bottom-5 right-5 z-[70] grid size-11 place-items-center rounded-full bg-[#3a2a25]/80 text-[#fdf3e7] shadow-lg backdrop-blur transition-colors hover:bg-[#3a2a25]"
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

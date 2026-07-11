"use client";

import { SPOTIFY_GREEN } from "../config";

/**
 * A decorative "now playing" scan strip in the Spotify-code style: the green
 * wordmark glyph, then a run of rounded bars of varying height. The bar heights
 * are derived deterministically from `seed` (the song label) so the same track
 * always draws the same code — and, crucially, the server and client agree (no
 * `Math.random`, no hydration mismatch). Purely visual: the real track is the
 * uploaded audio.
 */

/** A tiny stable string hash (djb2), used to seed the bar pattern. */
function hash(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return h >>> 0;
}

/** 23 bars, each 3–20px tall, derived from the seed via a small LCG. */
function barHeights(seed: string, count = 23): number[] {
  let state = hash(seed || "kyndl") || 1;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    // Linear congruential step — deterministic, spread across the range.
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    out.push(3 + (state % 18));
  }
  return out;
}

export function ScanCode({
  seed,
  barColor,
  className,
}: {
  seed: string;
  /** Colour of the scan bars (the Spotify glyph itself stays green). */
  barColor: string;
  className?: string;
}) {
  const bars = barHeights(seed);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Spotify wordmark glyph */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-5 shrink-0"
        fill={SPOTIFY_GREEN}
      >
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 1 1-.277-1.215c3.808-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857Zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.13-9.965-1.166a.78.78 0 1 1-.452-1.492c3.632-1.102 8.147-.568 11.232 1.328a.78.78 0 0 1 .257 1.073Zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 1 1-.542-1.79c3.532-1.072 9.405-.865 13.115 1.338a.936.936 0 0 1-.955 1.608Z" />
      </svg>
      <div className="flex h-6 items-center gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full"
            style={{ height: `${h}px`, backgroundColor: barColor }}
          />
        ))}
      </div>
    </div>
  );
}

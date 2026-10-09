"use client";

/**
 * Photoreal hand for the letter-opening ceremony.
 * Asset is chroma-keyed from a studio shot (forearm from top-right,
 * fingers reaching down to pinch / lift a seal).
 */
export function OpeningHand({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public asset
    <img
      src="/twenty-four-reasons/opening-hand.png"
      alt=""
      aria-hidden
      draggable={false}
      className={`select-none object-contain ${className}`}
      style={{
        filter:
          "drop-shadow(6px 18px 16px rgba(42, 26, 20, 0.42)) drop-shadow(1px 4px 4px rgba(42, 26, 20, 0.22))",
      }}
    />
  );
}

export type OpeningPhase =
  | "idle"
  | "approach"
  | "lift"
  | "flap"
  | "draw"
  | "read";

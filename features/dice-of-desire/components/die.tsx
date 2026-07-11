"use client";

/**
 * A single die face, 1–6, drawn as pips on a 3×3 grid. Used by the player to
 * show the two dice; an optional `accent` tints the pips to the rolled square's
 * heat once it settles.
 */

/** Which of the nine 3×3 slots are filled for each face value. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Die({
  value,
  accent = "#3a0a16",
  size = 64,
  /** When true, drop the heavy drop-shadow (for tiny chart headers). */
  flat = false,
}: {
  value: number;
  /** Pip colour once the die has settled. */
  accent?: string;
  size?: number;
  flat?: boolean;
}) {
  const lit = PIPS[value] ?? PIPS[1]!;
  return (
    <div
      className={`grid grid-cols-3 grid-rows-3 bg-white ${
        flat ? "" : "shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
      }`}
      style={{
        width: size,
        height: size,
        padding: Math.max(2, size * 0.13),
        borderRadius: Math.max(4, size * 0.22),
      }}
      aria-label={`Die showing ${value}`}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span className="grid place-items-center" key={i}>
          {lit.includes(i) && (
            <span
              className="block rounded-full"
              style={{
                width: size * 0.13,
                height: size * 0.13,
                background: accent,
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

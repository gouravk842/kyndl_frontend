"use client";

/**
 * A scattered layer of white chalk-style doodles (clouds, hearts, a music note,
 * infinity, glasses, a mug) drawn behind the name and string. Purely decorative
 * and fixed-position, so it renders identically on the server and client. Stroke
 * colour comes from the theme's `chalk`.
 */
export function ChalkDoodles({ color }: { color: string }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
      {/* cloud, top-left */}
      <svg viewBox="0 0 40 24" className="absolute top-[8%] left-[7%] w-12">
        <path
          {...common}
          d="M8 18c-4 0-6-3-4-6 1-4 6-4 8-1 1-4 7-4 9 0 4-1 7 2 6 5-1 2-3 2-4 2H8Z"
        />
      </svg>
      {/* infinity, top-right */}
      <svg viewBox="0 0 44 20" className="absolute top-[10%] right-[8%] w-12">
        <path
          {...common}
          d="M12 10c0-4-6-4-6 0s6 4 8 0c2-4 8-4 8 0s-6 4-8 0"
        />
      </svg>
      {/* glasses, upper-right */}
      <svg viewBox="0 0 44 18" className="absolute top-[26%] right-[6%] w-12">
        <circle {...common} cx="10" cy="9" r="6" />
        <circle {...common} cx="30" cy="9" r="6" />
        <path {...common} d="M16 9h8M36 7l5-3M4 7L1 5" />
      </svg>
      {/* small heart, mid-left */}
      <svg viewBox="0 0 24 22" className="absolute top-[40%] left-[6%] w-7">
        <path
          {...common}
          d="M12 20S3 14 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 6-9 12-9 12Z"
        />
      </svg>
      {/* mug, top-mid */}
      <svg viewBox="0 0 28 26" className="absolute top-[6%] left-[42%] w-8">
        <path {...common} d="M6 10h13v9a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-9Z" />
        <path {...common} d="M19 12h3a3 3 0 0 1 0 6h-3M9 6c0-2 2-2 2-4M14 6c0-2 2-2 2-4" />
      </svg>
      {/* music notes, bottom-left */}
      <svg viewBox="0 0 30 28" className="absolute bottom-[10%] left-[8%] w-8">
        <path {...common} d="M11 22V6l12-3v14" />
        <circle {...common} cx="8" cy="22" r="3" />
        <circle {...common} cx="20" cy="19" r="3" />
      </svg>
      {/* sparkle, bottom-right */}
      <svg viewBox="0 0 24 24" className="absolute right-[10%] bottom-[12%] w-7">
        <path {...common} d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      </svg>
    </div>
  );
}

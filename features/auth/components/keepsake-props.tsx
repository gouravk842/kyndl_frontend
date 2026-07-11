/**
 * Hand-drawn keepsake props for the auth journal page. Pure inline SVG so they
 * stay crisp, theme-friendly, and asset-free — swap for PNGs later if a more
 * photoreal look is ever wanted.
 */

type SvgProps = React.ComponentProps<"svg">;

/** Vintage pocket stopwatch — the "made in minutes" prop. */
export function Stopwatch({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 100 116" className={className} aria-hidden {...props}>
      <defs>
        <radialGradient id="sw-face" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="100%" stopColor="#f0e2c8" />
        </radialGradient>
        <linearGradient id="sw-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c485" />
          <stop offset="50%" stopColor="#c9993f" />
          <stop offset="100%" stopColor="#9a6f28" />
        </linearGradient>
      </defs>
      {/* crown + ring */}
      <rect x="44" y="2" width="12" height="10" rx="2" fill="url(#sw-rim)" />
      <circle
        cx="50"
        cy="16"
        r="6"
        fill="none"
        stroke="#c9993f"
        strokeWidth="3"
      />
      {/* side pushers */}
      <rect
        x="20"
        y="20"
        width="8"
        height="7"
        rx="2"
        fill="url(#sw-rim)"
        transform="rotate(-38 24 23)"
      />
      <rect
        x="72"
        y="20"
        width="8"
        height="7"
        rx="2"
        fill="url(#sw-rim)"
        transform="rotate(38 76 23)"
      />
      {/* case */}
      <circle cx="50" cy="66" r="44" fill="url(#sw-rim)" />
      <circle cx="50" cy="66" r="39" fill="#7c5a22" />
      <circle cx="50" cy="66" r="36" fill="url(#sw-face)" />
      {/* ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r1 = 32;
        const r2 = i % 3 === 0 ? 26 : 29;
        return (
          <line
            key={i}
            x1={50 + r1 * Math.sin(a)}
            y1={66 - r1 * Math.cos(a)}
            x2={50 + r2 * Math.sin(a)}
            y2={66 - r2 * Math.cos(a)}
            stroke="#6b4a1e"
            strokeWidth={i % 3 === 0 ? 2.4 : 1.2}
            strokeLinecap="round"
          />
        );
      })}
      {/* hands */}
      <line
        x1="50"
        y1="66"
        x2="50"
        y2="44"
        stroke="#3a2a25"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="66"
        x2="67"
        y2="72"
        stroke="#c75b39"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="66" r="3.2" fill="#3a2a25" />
    </svg>
  );
}

/** Heart locket clipped to the page by a golden paperclip. */
export function HeartLocket({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 80 120" className={className} aria-hidden {...props}>
      <defs>
        <linearGradient id="hl-clip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4d58a" />
          <stop offset="100%" stopColor="#c79b3e" />
        </linearGradient>
        <linearGradient id="hl-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0637a" />
          <stop offset="100%" stopColor="#c22740" />
        </linearGradient>
      </defs>
      {/* paperclip */}
      <path
        d="M40 6 v52 a12 12 0 0 0 24 0 V18"
        fill="none"
        stroke="url(#hl-clip)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M52 14 v46 a4 4 0 0 1 -8 0 V26"
        fill="none"
        stroke="url(#hl-clip)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* locket heart */}
      <path
        d="M40 118 C 8 92 12 62 30 62 C 38 62 40 70 40 74 C 40 70 42 62 50 62 C 68 62 72 92 40 118 Z"
        fill="url(#hl-heart)"
        stroke="#9a1f34"
        strokeWidth="1.5"
      />
      {/* inner window */}
      <path
        d="M40 104 C 24 90 26 74 34 74 C 38 74 40 78 40 80 C 40 78 42 74 46 74 C 54 74 56 90 40 104 Z"
        fill="#fff"
        opacity="0.9"
      />
      <circle cx="40" cy="70" r="2.4" fill="#fbe3a1" />
    </svg>
  );
}

/** Little five-point spark star. */
export function SparkStar({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...props}>
      <path
        d="M12 1 L14.6 8.5 L22.5 8.9 L16.2 13.6 L18.4 21.2 L12 16.7 L5.6 21.2 L7.8 13.6 L1.5 8.9 L9.4 8.5 Z"
        fill="#f0a13d"
        stroke="#c98a2e"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Wax seal stamped with the Kyndl "k". */
export function WaxSeal({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 72 72" className={className} aria-hidden {...props}>
      <defs>
        <radialGradient id="wax" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#d9576b" />
          <stop offset="60%" stopColor="#b23347" />
          <stop offset="100%" stopColor="#8a2233" />
        </radialGradient>
      </defs>
      <path
        d="M36 3 c6 0 8 5 14 6 s10-2 12 4 -2 9 0 14 4 8 0 13 -6 6 -8 12 -3 9 -9 10 -8-3-14-3 -10 4 -15 1 -5-8-9-11 -9-5-9-11 6-6 6-12 -4-9 0-14 8-2 12-6 6-7 12-7 Z"
        fill="url(#wax)"
        stroke="#7a1d2c"
        strokeWidth="1.2"
      />
      <circle
        cx="36"
        cy="36"
        r="20"
        fill="none"
        stroke="#7d2233"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <text
        x="36"
        y="47"
        textAnchor="middle"
        fontFamily="var(--font-cursive), cursive"
        fontSize="30"
        fill="#7a1d2c"
        opacity="0.75"
      >
        k
      </text>
    </svg>
  );
}

/** Spool of golden binding thread that sits on the desk. */
export function ThreadSpool({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden {...props}>
      <defs>
        <linearGradient id="ts-thread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9c56a" />
          <stop offset="100%" stopColor="#b98a2f" />
        </linearGradient>
      </defs>
      <ellipse cx="48" cy="80" rx="34" ry="8" fill="rgba(58,42,37,0.16)" />
      {/* end caps */}
      <ellipse cx="48" cy="24" rx="30" ry="9" fill="#d8b98b" />
      <ellipse cx="48" cy="70" rx="30" ry="9" fill="#c7a473" />
      {/* wound thread body */}
      <rect x="18" y="24" width="60" height="46" fill="url(#ts-thread)" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={i}
          x1="18"
          y1={28 + i * 5}
          x2="78"
          y2={26 + i * 5}
          stroke="#f4dc9a"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      <ellipse
        cx="48"
        cy="24"
        rx="30"
        ry="9"
        fill="none"
        stroke="#b9985f"
        strokeWidth="1.5"
      />
      <ellipse cx="48" cy="24" rx="8" ry="2.6" fill="#8a6a3a" />
      {/* loose strand */}
      <path
        d="M76 40 q22 6 14 26 t-6 18"
        fill="none"
        stroke="url(#ts-thread)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

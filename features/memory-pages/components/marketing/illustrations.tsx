/**
 * Hand-authored line-art + decorative flourishes for the Memory Pages product
 * page. All strokes use `currentColor` so callers colour them with text-*;
 * every shape is inline SVG so the page stays self-contained (no image
 * fetches, on-brand, and crisp at any size).
 */

type SvgProps = { className?: string };

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ── Highlight tile icons ─────────────────────────────────────────── */

export function CameraIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <g {...line}>
        <rect x="6" y="15" width="36" height="24" rx="4" />
        <path d="M17 15l3-4h8l3 4" />
        <circle cx="24" cy="27" r="7" />
        <circle cx="24" cy="27" r="3" />
        <path d="M35 20h2" />
      </g>
    </svg>
  );
}

export function JournalIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <g {...line}>
        <path d="M12 8h16a4 4 0 0 1 4 4v28l-6-3-6 3V8" opacity="0" />
        <rect x="11" y="9" width="20" height="30" rx="2" />
        <path d="M16 16h10M16 21h10M16 26h6" />
        {/* a pen laid across the page */}
        <path d="M28 34l9-9 3 3-9 9-4 1z" />
        <path d="M35 27l3 3" />
      </g>
    </svg>
  );
}

export function OpenBookIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <g {...line}>
        <path d="M24 14v24" />
        <path d="M24 14c-3-2.5-8-3-13-2v22c5-1 10-.5 13 2" />
        <path d="M24 14c3-2.5 8-3 13-2v22c-5-1-10-.5-13 2" />
        <path d="M9 12l-2 1v22l2-1M39 12l2 1v22l-2-1" />
      </g>
    </svg>
  );
}

/* ── "How it works" step line-art ─────────────────────────────────── */

/** A hand holding out a polaroid print. */
export function HandPhotoIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 72 56" className={className} aria-hidden>
      <g {...line}>
        <rect
          x="20"
          y="6"
          width="24"
          height="28"
          rx="1.5"
          transform="rotate(-8 32 20)"
        />
        <path d="M24 26l6-6 4 4 5-6 5 7" transform="rotate(-8 32 20)" />
        <circle cx="27.5" cy="15" r="2" transform="rotate(-8 32 20)" />
        {/* fingers cupping the bottom */}
        <path d="M18 40c2-3 6-3 9-1 3 2 8 2 12 1M18 40l-4 4M27 39l0 5M35 40l1 5M42 39l3 4" />
      </g>
    </svg>
  );
}

/** An open book with written lines — writing it up. */
export function WriteBookIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 72 56" className={className} aria-hidden>
      <g {...line}>
        <path d="M36 14v30" />
        <path d="M36 14c-4-3-11-3.5-17-2.5v28c6-1 13-.5 17 2.5" />
        <path d="M36 14c4-3 11-3.5 17-2.5v28c-6-1-13-.5-17 2.5" />
        <path d="M23 20h8M23 25h8M23 30h5" opacity="0.9" />
        <path d="M41 20h8M41 25h8M41 30h5" opacity="0.9" />
      </g>
    </svg>
  );
}

/** A sealed envelope with a heart wax seal — sharing the album. */
export function EnvelopeSealIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 72 56" className={className} aria-hidden>
      <g {...line}>
        <rect x="16" y="12" width="40" height="30" rx="2.5" />
        <path d="M16 15l20 15 20-15" />
        <circle cx="36" cy="34" r="6" fill="currentColor" opacity="0.12" />
        <path d="M36 37c-2-1.6-3.4-2.8-3.4-4.3 0-1 .8-1.7 1.7-1.7.6 0 1.2.3 1.7.9.5-.6 1.1-.9 1.7-.9.9 0 1.7.7 1.7 1.7 0 1.5-1.4 2.7-3.4 4.3z" />
      </g>
    </svg>
  );
}

/* ── Hero desk flourishes ─────────────────────────────────────────── */

/** An ink bottle with a dip pen resting in it. */
export function InkBottleIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 64 88" className={className} aria-hidden>
      <g {...line}>
        <path d="M20 52h24v20a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6z" />
        <path d="M20 58h24" />
        <rect x="24" y="46" width="16" height="6" rx="1.5" />
        <path d="M28 46v-4h8v4" />
        {/* dip pen */}
        <path d="M40 60L58 20" />
        <path d="M56 16l4 2-2 4-4-2z" />
        <path d="M38 62l4 2" />
      </g>
    </svg>
  );
}

/** A slender eucalyptus sprig. */
export function EucalyptusIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 60 120" className={className} aria-hidden>
      <g {...line}>
        <path d="M30 116C28 90 30 40 40 8" />
        {[18, 30, 42, 54, 66, 78, 90].map((y, i) => {
          const left = i % 2 === 0;
          const cx = left ? 30 - 12 : 30 + 12;
          return (
            <ellipse
              key={y}
              cx={cx}
              cy={y}
              rx="9"
              ry="5.5"
              transform={`rotate(${left ? -32 : 32} ${cx} ${y})`}
              fill="currentColor"
              fillOpacity="0.08"
            />
          );
        })}
      </g>
    </svg>
  );
}

/** A small postage stamp for the collage CTA. */
export function StampIllustration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 56 64" className={className} aria-hidden>
      <g {...line}>
        <path d="M6 6h44v52H6z" strokeDasharray="2 3.4" />
        <rect x="12" y="12" width="32" height="40" rx="1.5" />
        <path d="M18 40l7-8 5 5 4-5 6 8" />
        <circle cx="22" cy="24" r="3" />
      </g>
    </svg>
  );
}

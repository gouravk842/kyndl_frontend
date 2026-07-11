/**
 * The Kyndl mark — two figures and a heart — drawn as a single monochrome shape
 * for stamping into the envelope's wax seal. Geometry mirrors `public/logo.svg`
 * (minus the wordmark and brand colours); it paints in `currentColor` so the
 * caller can tint it to an embossed gold.
 */
export function KyndlSealMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="22 12 166 100"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      {/* left figure */}
      <circle cx="52" cy="32" r="16" />
      <path d="M30 82 C30 60 74 60 74 82 L74 106 L30 106 Z" />
      {/* right figure */}
      <circle cx="158" cy="32" r="16" />
      <path d="M136 82 C136 60 180 60 180 82 L180 106 L136 106 Z" />
      {/* heart between them */}
      <path d="M105 70 Q105 50 116 46 Q127 42 127 56 Q127 64 105 78 Q83 64 83 56 Q83 42 94 46 Q105 50 105 70Z" />
    </svg>
  );
}

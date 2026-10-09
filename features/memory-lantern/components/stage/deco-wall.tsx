/**
 * Quiet Art Deco wall: a gilt arch, a meander, and a few corner fans.
 * Lines stay pale so the room still feels like evening, not a diagram.
 */
export function DecoWall() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern
          id="lantern-meander"
          width="22"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 9 H7 V3 H14 V9 H22"
            fill="none"
            stroke="#e8c872"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <g fill="none" stroke="#e8c872" strokeWidth="1.15" opacity="0.42">
        <path d="M250 640 V310 A350 320 0 0 1 950 310 V640" />
        <path d="M300 640 V340 A300 270 0 0 1 900 340 V640" opacity="0.7" />
        <path d="M430 250 A170 150 0 0 1 770 250" />
        <path d="M560 168 L600 128 L640 168" />
        <path d="M600 128 V168" />
        <circle cx="600" cy="188" r="7" />
      </g>
      <rect
        x="310"
        y="318"
        width="580"
        height="12"
        fill="url(#lantern-meander)"
        opacity="0.4"
      />
      <rect
        x="180"
        y="690"
        width="840"
        height="12"
        fill="url(#lantern-meander)"
        opacity="0.28"
      />
      <g stroke="#e8c872" fill="none" strokeWidth="1" opacity="0.34">
        <Fan cx={150} cy={150} />
        <Fan cx={1050} cy={150} />
        <Fan cx={150} cy={560} />
        <Fan cx={1050} cy={560} />
      </g>
    </svg>
  );
}

function Fan({ cx, cy }: { cx: number; cy: number }) {
  const rays = [-50, -25, 0, 25, 50];
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {rays.map((angle) => (
        <line
          key={angle}
          x1="0"
          y1="0"
          x2="0"
          y2="-46"
          transform={`rotate(${angle})`}
        />
      ))}
      <path d="M-18 0 L0 -18 L18 0 L0 18 Z" />
      <circle r="3" />
    </g>
  );
}

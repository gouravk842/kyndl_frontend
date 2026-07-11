"use client";

import { cellCenter, LADDERS, SNAKES } from "../config";

/**
 * The snakes & ladders drawn over the board grid, in a 0–100 square coordinate
 * space (the board is square, so it maps 1:1 to percentages). Ladders are
 * shaded brass tubes with rungs; snakes are tapering, glossy bodies with scales,
 * eyes and a forked tongue. Purely decorative — the game logic lives elsewhere.
 */

// A handful of snake colourways so the board feels alive, not stamped out.
const SNAKE_SKINS = [
  { dark: "#1f6b3a", body: "#3fae5e", light: "#a6f0bd", belly: "#e8ffd9" },
  { dark: "#155e63", body: "#2fa6ad", light: "#9af0f3", belly: "#dffafa" },
  { dark: "#8a1f3c", body: "#d83b62", light: "#ffb3c8", belly: "#ffe1ea" },
  { dark: "#5a2a86", body: "#9457c7", light: "#dcb6f5", belly: "#f1e2ff" },
  { dark: "#8a5a12", body: "#d89a2e", light: "#ffdf95", belly: "#fff2cf" },
];

export function BoardOverlay() {
  const snakes = Object.entries(SNAKES);
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <filter id="snl-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.6" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <linearGradient id="snl-brass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a5616" />
          <stop offset="45%" stopColor="#f2c862" />
          <stop offset="55%" stopColor="#fff0bf" />
          <stop offset="100%" stopColor="#8a6320" />
        </linearGradient>
      </defs>

      {Object.entries(LADDERS).map(([bottom, top]) => (
        <Ladder key={`l-${bottom}`} from={Number(bottom)} to={top} />
      ))}
      {snakes.map(([head, tail], i) => (
        <Snake key={`s-${head}`} id={i} from={Number(head)} to={tail} />
      ))}
    </svg>
  );
}

// ── A ladder: two shaded brass rails with evenly spaced rungs ─────────────
function Ladder({ from, to }: { from: number; to: number }) {
  const a = cellCenter(from);
  const b = cellCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular, half the rail spacing.
  const px = -uy * 1.7;
  const py = ux * 1.7;

  const railL = { a: { x: a.x + px, y: a.y + py }, b: { x: b.x + px, y: b.y + py } };
  const railR = { a: { x: a.x - px, y: a.y - py }, b: { x: b.x - px, y: b.y - py } };

  // A rung roughly every 4.5 units along the climb.
  const count = Math.max(2, Math.round(len / 4.5));
  const rungs = Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count;
    return {
      x1: railL.a.x + (railL.b.x - railL.a.x) * t,
      y1: railL.a.y + (railL.b.y - railL.a.y) * t,
      x2: railR.a.x + (railR.b.x - railR.a.x) * t,
      y2: railR.a.y + (railR.b.y - railR.a.y) * t,
    };
  });

  return (
    <g filter="url(#snl-shadow)" strokeLinecap="round">
      {/* rungs (under the rails) */}
      {rungs.map((r, i) => (
        <g key={i}>
          <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#6e4e12" strokeWidth={1.1} />
          <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="url(#snl-brass)" strokeWidth={0.7} />
        </g>
      ))}
      {/* rails: dark tube + bright highlight */}
      {[railL, railR].map((rail, i) => (
        <g key={i}>
          <line x1={rail.a.x} y1={rail.a.y} x2={rail.b.x} y2={rail.b.y} stroke="#6e4e12" strokeWidth={1.7} />
          <line x1={rail.a.x} y1={rail.a.y} x2={rail.b.x} y2={rail.b.y} stroke="url(#snl-brass)" strokeWidth={1.1} />
          <line
            x1={rail.a.x - px * 0.25}
            y1={rail.a.y - py * 0.25}
            x2={rail.b.x - px * 0.25}
            y2={rail.b.y - py * 0.25}
            stroke="#fff6da"
            strokeWidth={0.28}
            opacity={0.8}
          />
        </g>
      ))}
    </g>
  );
}

// ── A snake: a glossy, tapering body with a head, eyes and forked tongue ──
function Snake({ id, from, to }: { id: number; from: number; to: number }) {
  const skin = SNAKE_SKINS[id % SNAKE_SKINS.length]!;
  const head = cellCenter(from);
  const tail = cellCenter(to);
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  // An S-curve: two cubic segments wobbling to alternating sides.
  const amp = Math.min(7, 2 + len * 0.12);
  const m = { x: head.x + dx * 0.5, y: head.y + dy * 0.5 };
  const c1 = { x: head.x + dx * 0.22 + px * amp, y: head.y + dy * 0.22 + py * amp };
  const c2 = { x: head.x + dx * 0.34 + px * amp, y: head.y + dy * 0.34 + py * amp };
  const c4 = { x: head.x + dx * 0.78 - px * amp, y: head.y + dy * 0.78 - py * amp };
  const d = `M ${head.x} ${head.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${m.x} ${m.y} S ${c4.x} ${c4.y}, ${tail.x} ${tail.y}`;

  const gid = `snl-snake-${id}-${from}`;
  // The head points back toward its first control point (the body's start).
  const ang = (Math.atan2(c1.y - head.y, c1.x - head.x) * 180) / Math.PI;

  return (
    <g filter="url(#snl-shadow)">
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={head.x} y1={head.y} x2={tail.x} y2={tail.y}>
          <stop offset="0%" stopColor={skin.body} />
          <stop offset="70%" stopColor={skin.body} />
          <stop offset="100%" stopColor={skin.dark} />
        </linearGradient>
      </defs>

      {/* dark outline → tapering body → belly scales → glossy spine */}
      <path d={d} fill="none" stroke={skin.dark} strokeWidth={4} strokeLinecap="round" />
      <path d={d} fill="none" stroke={`url(#${gid})`} strokeWidth={3} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={skin.belly}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeDasharray="0.7 1.7"
        opacity={0.55}
      />
      <path d={d} fill="none" stroke={skin.light} strokeWidth={0.7} strokeLinecap="round" opacity={0.65} />

      {/* head */}
      <g transform={`translate(${head.x} ${head.y}) rotate(${ang})`}>
        {/* tongue, flicking away from the body */}
        <g stroke="#e02b3f" strokeWidth={0.45} strokeLinecap="round" fill="none">
          <line x1={-2} y1={0} x2={-4.4} y2={-0.8} />
          <line x1={-2} y1={0} x2={-4.4} y2={0.8} />
        </g>
        <ellipse cx={0} cy={0} rx={3.1} ry={2.3} fill={skin.dark} />
        <ellipse cx={0.2} cy={-0.2} rx={2.6} ry={1.9} fill={skin.body} />
        <ellipse cx={1.1} cy={-0.7} rx={1.4} ry={0.7} fill={skin.light} opacity={0.7} />
        {/* eyes */}
        <circle cx={0.6} cy={-1} r={0.62} fill="#fff" />
        <circle cx={0.6} cy={1} r={0.62} fill="#fff" />
        <circle cx={0.75} cy={-1} r={0.3} fill="#1a1a1a" />
        <circle cx={0.75} cy={1} r={0.3} fill="#1a1a1a" />
      </g>
      {/* tail tip */}
      <circle cx={tail.x} cy={tail.y} r={0.8} fill={skin.dark} />
    </g>
  );
}

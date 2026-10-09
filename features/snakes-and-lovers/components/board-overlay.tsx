"use client";

import { cellCenter, LADDERS, SNAKES } from "../config";

/**
 * Snakes and ladders drawn under the square numbers. Ladders are slim brass
 * rails; snakes are a short curve. Each path has a ring at the square you
 * land on, an arrowhead or dot where it ends, and an up/down mark so the
 * direction is not carried by colour alone.
 */

const SNAKE_SKINS = [
  { dark: "#1f6b3a", body: "#3fae5e", light: "#d9ffe8" },
  { dark: "#155e63", body: "#2fa6ad", light: "#d7fbfc" },
  { dark: "#8a1f3c", body: "#d83b62", light: "#ffd5e2" },
  { dark: "#5a2a86", body: "#9457c7", light: "#edd9ff" },
  { dark: "#8a5a12", body: "#d89a2e", light: "#fff0c9" },
];

const BODY_OPACITY = 0.72;

export function BoardOverlay() {
  const snakes = Object.entries(SNAKES);
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="snl-brass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a5616" />
          <stop offset="45%" stopColor="#f2c862" />
          <stop offset="100%" stopColor="#8a6320" />
        </linearGradient>
      </defs>

      <g opacity={BODY_OPACITY}>
        {Object.entries(LADDERS).map(([bottom, top]) => (
          <LadderBody key={`l-${bottom}`} from={Number(bottom)} to={top} />
        ))}
        {snakes.map(([head, tail], i) => (
          <SnakeBody key={`s-${head}`} id={i} from={Number(head)} to={tail} />
        ))}
      </g>

      {Object.entries(LADDERS).map(([bottom, top]) => (
        <PathEnds
          key={`le-${bottom}`}
          from={Number(bottom)}
          to={top}
          kind="ladder"
        />
      ))}
      {snakes.map(([head, tail]) => (
        <PathEnds
          key={`se-${head}`}
          from={Number(head)}
          to={tail}
          kind="snake"
        />
      ))}
    </svg>
  );
}

function LadderBody({ from, to }: { from: number; to: number }) {
  const a = cellCenter(from);
  const b = cellCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy * 1.05;
  const py = ux * 1.05;

  const railL = {
    a: { x: a.x + px, y: a.y + py },
    b: { x: b.x + px, y: b.y + py },
  };
  const railR = {
    a: { x: a.x - px, y: a.y - py },
    b: { x: b.x - px, y: b.y - py },
  };
  const count = Math.max(2, Math.round(len / 6));
  const rungs = Array.from({ length: count - 1 }, (_, i) => {
    const t = (i + 1) / count;
    return {
      x1: railL.a.x + (railL.b.x - railL.a.x) * t,
      y1: railL.a.y + (railL.b.y - railL.a.y) * t,
      x2: railR.a.x + (railR.b.x - railR.a.x) * t,
      y2: railR.a.y + (railR.b.y - railR.a.y) * t,
    };
  });

  return (
    <g strokeLinecap="round">
      {rungs.map((rung, i) => (
        <line
          key={i}
          x1={rung.x1}
          y1={rung.y1}
          x2={rung.x2}
          y2={rung.y2}
          stroke="#f2c862"
          strokeWidth={0.45}
        />
      ))}
      {[railL, railR].map((rail, i) => (
        <line
          key={i}
          x1={rail.a.x}
          y1={rail.a.y}
          x2={rail.b.x}
          y2={rail.b.y}
          stroke="url(#snl-brass)"
          strokeWidth={0.7}
        />
      ))}
    </g>
  );
}

function SnakeBody({ id, from, to }: { id: number; from: number; to: number }) {
  const skin = SNAKE_SKINS[id % SNAKE_SKINS.length]!;
  const head = cellCenter(from);
  const tail = cellCenter(to);
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  // A small bow. The layout keeps centre-lines far enough apart that this
  // cannot reach a neighbouring path.
  const amp = 0.65;
  const c1 = {
    x: head.x + dx * 0.35 + px * amp,
    y: head.y + dy * 0.35 + py * amp,
  };
  const c2 = {
    x: head.x + dx * 0.65 + px * amp,
    y: head.y + dy * 0.65 + py * amp,
  };
  const d = `M ${head.x} ${head.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${tail.x} ${tail.y}`;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={skin.dark}
        strokeWidth={1.45}
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke={skin.body}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke={skin.light}
        strokeWidth={0.28}
        strokeLinecap="round"
      />
    </g>
  );
}

function PathEnds({
  from,
  to,
  kind,
}: {
  from: number;
  to: number;
  kind: "ladder" | "snake";
}) {
  const a = cellCenter(from);
  const b = cellCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const mark = { x: a.x + px * 2.15, y: a.y + py * 2.15 };
  const up = kind === "ladder";
  const ring = up ? "#fff6df" : "#e9fff4";
  const ink = up ? "#5c4010" : "#143d28";
  const tip = 1.35;
  const wing = 0.72;
  const baseX = b.x - ux * tip;
  const baseY = b.y - uy * tip;

  return (
    <g>
      <circle
        cx={a.x}
        cy={a.y}
        r={1.55}
        fill="none"
        stroke={ink}
        strokeWidth={0.55}
      />
      <circle
        cx={a.x}
        cy={a.y}
        r={1.55}
        fill="none"
        stroke={ring}
        strokeWidth={0.28}
      />
      {up ? (
        <polygon
          points={`${b.x},${b.y} ${baseX + px * wing},${baseY + py * wing} ${baseX - px * wing},${baseY - py * wing}`}
          fill="#f2c862"
          stroke={ink}
          strokeWidth={0.2}
          strokeLinejoin="round"
        />
      ) : (
        <circle
          cx={b.x}
          cy={b.y}
          r={0.72}
          fill={ink}
          stroke={ring}
          strokeWidth={0.22}
        />
      )}
      <DirectionGlyph x={mark.x} y={mark.y} up={up} ink={ink} fill={ring} />
    </g>
  );
}

function DirectionGlyph({
  x,
  y,
  up,
  ink,
  fill,
}: {
  x: number;
  y: number;
  up: boolean;
  ink: string;
  fill: string;
}) {
  const s = 0.85;
  const tipY = up ? y - s : y + s;
  const baseY = up ? y + s * 0.55 : y - s * 0.55;
  const points = `${x - s},${baseY} ${x},${tipY} ${x + s},${baseY}`;
  return (
    <g>
      <polyline
        points={points}
        fill="none"
        stroke={fill}
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={points}
        fill="none"
        stroke={ink}
        strokeWidth={0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

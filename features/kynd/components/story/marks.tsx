import { useId } from "react";

import { cn } from "@/lib/utils";

type MarkProps = { className?: string };

function frame(className: string | undefined, base: string) {
  return cn(base, className);
}

export function Tulip({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 76"
      className={frame(className, "h-16 w-12")}
      fill="none"
      aria-hidden
    >
      <path d="M24 74V34" stroke="#5c6b56" strokeWidth="1.2" />
      <path d="M24 52c-6-2-12-6-11-12" stroke="#5c6b56" strokeWidth="1.1" />
      <path d="M24 48c5-1 11-5 10-12" stroke="#5c6b56" strokeWidth="1.1" />
      <path
        d="M24 36c-8 0-14-10-8-18 4-2 8 2 8 2s4-4 8-2c6 8 0 18-8 18Z"
        fill="#fbf7f2"
        stroke="#2c2420"
        strokeWidth="1.15"
      />
      <path d="M24 20v12" stroke="#2c2420" strokeWidth="0.6" opacity="0.45" />
    </svg>
  );
}

export function Lipstick({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 40 76"
      className={frame(className, "h-16 w-10")}
      fill="none"
      aria-hidden
    >
      <path d="M14 30c0-8 2-16 6-20 4 4 6 12 6 20" fill="#8e1020" />
      <rect x="12" y="28" width="16" height="8" fill="#c4a574" />
      <rect
        x="12"
        y="34"
        width="16"
        height="34"
        rx="1.5"
        fill="#fbf7f2"
        stroke="#2c2420"
        strokeWidth="1.15"
      />
      <path d="M12 44h16" stroke="#2c2420" strokeWidth="0.6" opacity="0.35" />
    </svg>
  );
}

export function Bowl({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 76 48"
      className={frame(className, "h-12 w-16")}
      fill="none"
      aria-hidden
    >
      <path
        d="M8 16h60c-3 16-14 24-30 24S11 32 8 16Z"
        fill="#fbf7f2"
        stroke="#2c2420"
        strokeWidth="1.15"
      />
      <path
        d="M18 16c4-6 10-4 14 0 4-6 12-6 16 0"
        stroke="#c4a574"
        strokeWidth="1.3"
      />
      <path
        d="M28 8c1 4-2 6-1 10M40 6c1 4-2 6-1 10"
        stroke="#2c2420"
        strokeWidth="0.8"
        opacity="0.35"
      />
    </svg>
  );
}

export function Tag({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 64"
      className={frame(className, "h-14 w-11")}
      fill="none"
      aria-hidden
    >
      <path
        d="M10 12h18l10 10v32H10V12Z"
        fill="#fbf7f2"
        stroke="#2c2420"
        strokeWidth="1.15"
      />
      <circle cx="22" cy="24" r="2.2" stroke="#8e1020" strokeWidth="1.1" />
      <path
        d="M16 36h16M16 42h10"
        stroke="#2c2420"
        strokeWidth="0.8"
        opacity="0.45"
      />
    </svg>
  );
}

export function StripeShoe({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 92 44"
      className={frame(className, "h-10 w-16")}
      fill="none"
      aria-hidden
    >
      <path
        d="M10 28c2-9 12-13 26-12h10l8-7c10-2 24 2 28 10 2 4 0 8-4 9H16c-5 0-8-1-6 0Z"
        fill="#2c2420"
      />
      <path
        d="M38 14c2 5 1 10-2 13M50 12c3 5 2 11-1 14"
        stroke="#f3ece4"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 31c6 3 62 4 76-1"
        stroke="#2c2420"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Postcard({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 78 56"
      className={frame(className, "h-12 w-16")}
      fill="none"
      aria-hidden
    >
      <g transform="rotate(-7 39 28)">
        <rect
          x="8"
          y="8"
          width="62"
          height="40"
          rx="2"
          fill="#fbf7f2"
          stroke="#2c2420"
          strokeWidth="1.15"
        />
        <path d="M14 34h24" stroke="#2c2420" strokeWidth="0.7" opacity="0.4" />
        <path d="M14 39h16" stroke="#2c2420" strokeWidth="0.7" opacity="0.4" />
        <circle cx="54" cy="22" r="6" stroke="#8e1020" strokeWidth="1.1" />
      </g>
    </svg>
  );
}

export function Disc({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 52 52"
      className={frame(className, "h-12 w-12")}
      aria-hidden
    >
      <circle cx="26" cy="26" r="20" fill="#241c1a" />
      <circle
        cx="26"
        cy="26"
        r="14"
        fill="none"
        stroke="#3d332e"
        strokeWidth="0.6"
      />
      <circle cx="26" cy="26" r="5.5" fill="#c4a574" />
      <circle cx="26" cy="26" r="1.6" fill="#241c1a" />
    </svg>
  );
}

export function Cup({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 58 50"
      className={frame(className, "h-12 w-14")}
      fill="none"
      aria-hidden
    >
      <path
        d="M10 16h28v16c0 8-6 12-14 12s-14-4-14-12V16Z"
        fill="#fbf7f2"
        stroke="#2c2420"
        strokeWidth="1.15"
      />
      <path
        d="M38 20h6c6 0 8 6 4 10s-8 2-10-1"
        stroke="#2c2420"
        strokeWidth="1.15"
      />
      <path
        d="M20 10c0-4 4-4 3-8M28 10c0-4 4-4 3-8"
        stroke="#2c2420"
        strokeWidth="0.8"
        opacity="0.35"
      />
    </svg>
  );
}

export function Headphones({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 56"
      className={frame(className, "h-12 w-14")}
      fill="none"
      aria-hidden
    >
      <path
        d="M10 30c0-14 10-22 22-22s22 8 22 22"
        stroke="#2c2420"
        strokeWidth="1.4"
      />
      <rect x="6" y="28" width="12" height="18" rx="3" fill="#2c2420" />
      <rect x="46" y="28" width="12" height="18" rx="3" fill="#2c2420" />
    </svg>
  );
}

export function Perfume({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 86"
      className={frame(className, "h-24 w-14")}
      fill="none"
      aria-hidden
    >
      <rect x="18" y="4" width="12" height="12" rx="1" fill="#2c2420" />
      <rect x="14" y="16" width="20" height="6" fill="#c4a574" />
      <path
        d="M10 24h28l-4 54H14L10 24Z"
        fill="#fbf7f2"
        stroke="#2c2420"
        strokeWidth="1.15"
      />
      <path d="M14 46h20v28H14V46Z" fill="#8e1020" opacity="0.82" />
    </svg>
  );
}

export function Cameo({ className }: MarkProps) {
  const uid = useId().replace(/:/g, "");
  const bg = `${uid}-bg`;
  const skin = `${uid}-skin`;
  const clip = `${uid}-clip`;

  return (
    <svg
      viewBox="0 0 240 320"
      className={frame(className, "h-72 w-52")}
      aria-hidden
    >
      <defs>
        <radialGradient id={bg} cx="50%" cy="36%" r="68%">
          <stop offset="0%" stopColor="#f8f3ec" />
          <stop offset="100%" stopColor="#e6d5c8" />
        </radialGradient>
        <linearGradient id={skin} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6dccb" />
          <stop offset="100%" stopColor="#d9b29b" />
        </linearGradient>
        <clipPath id={clip}>
          <rect x="28" y="18" width="184" height="284" rx="92" />
        </clipPath>
      </defs>
      <rect
        x="28"
        y="18"
        width="184"
        height="284"
        rx="92"
        fill={`url(#${bg})`}
      />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="122" cy="168" rx="86" ry="108" fill="#241c1a" />
        <path d="M98 188h52v78H98v-78Z" fill="#e7c4af" />
        <ellipse cx="128" cy="156" rx="48" ry="60" fill={`url(#${skin})`} />
        <path
          d="M58 162c4-70 42-104 86-98 32 4 52 34 50 70-16-6-30-40-58-46-30-6-62 10-70 46-4 16-8 24-8 28Z"
          fill="#241c1a"
        />
        <path d="M-20 340c36-78 78-108 140-108s104 30 140 108" fill="#2c2420" />
        <ellipse cx="156" cy="132" rx="16" ry="26" fill="#fff" opacity="0.2" />
      </g>
      <rect
        x="28.5"
        y="18.5"
        width="183"
        height="283"
        rx="92"
        fill="none"
        stroke="#e4d5c8"
      />
    </svg>
  );
}

export function Heart({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 44"
      className={frame(className, "h-10 w-11")}
      aria-hidden
    >
      <path
        d="M24 38C14 30 6 23 6 15 6 9 11 5 16 5c4 0 6 2 8 5 2-3 4-5 8-5 5 0 10 4 10 10 0 8-8 15-18 23Z"
        fill="#F2596F"
      />
    </svg>
  );
}

const MARKS = {
  tulip: Tulip,
  lipstick: Lipstick,
  bowl: Bowl,
  tag: Tag,
  shoe: StripeShoe,
  postcard: Postcard,
  disc: Disc,
  cup: Cup,
  headphones: Headphones,
  perfume: Perfume,
  heart: Heart,
} as const;

export type MarkName = keyof typeof MARKS;

export function Mark({
  name,
  className,
}: {
  name: MarkName;
  className?: string;
}) {
  const Glyph = MARKS[name];
  return <Glyph className={className} />;
}

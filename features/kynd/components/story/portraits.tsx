import { useId } from "react";

import { cn } from "@/lib/utils";

export type HairStyle = "long" | "short" | "tied";

export function PersonAvatar({
  skin = "#f6dccb",
  skinDeep = "#d9b29b",
  hair = "#241c1a",
  shirt = "#3A2A25",
  hairStyle = "long",
  className,
  label = "Person",
}: {
  skin?: string;
  skinDeep?: string;
  hair?: string;
  shirt?: string;
  hairStyle?: HairStyle;
  className?: string;
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const tone = `${uid}-skin`;
  const clip = `${uid}-clip`;

  return (
    <svg
      viewBox="0 0 240 320"
      className={cn("h-40 w-28", className)}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={tone} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinDeep} />
        </linearGradient>
        <clipPath id={clip}>
          <rect x="28" y="18" width="184" height="284" rx="92" />
        </clipPath>
      </defs>
      <rect x="28" y="18" width="184" height="284" rx="92" fill="#F8F1EA" />
      <g clipPath={`url(#${clip})`}>
        {hairStyle === "long" ? (
          <ellipse cx="120" cy="176" rx="78" ry="110" fill={hair} />
        ) : null}
        <path d="M96 196h52v80H96v-80Z" fill={skinDeep} />
        <ellipse cx="124" cy="158" rx="46" ry="58" fill={`url(#${tone})`} />
        {hairStyle === "short" ? (
          <path
            d="M74 150c2-52 30-78 62-72 24 4 40 26 36 54-24-20-46-24-70-6-8 6-18 14-28 24Z"
            fill={hair}
          />
        ) : (
          <path
            d="M62 164c4-68 40-100 82-94 30 4 50 32 48 66-16-6-28-38-56-44-30-6-60 10-66 44-4 14-8 22-8 28Z"
            fill={hair}
          />
        )}
        {hairStyle === "tied" ? (
          <circle cx="128" cy="98" r="14" fill={hair} />
        ) : null}
        <path d="M-16 340c34-78 76-108 136-108s102 30 136 108" fill={shirt} />
        <ellipse cx="150" cy="136" rx="14" ry="22" fill="#fff" opacity="0.18" />
      </g>
      <rect
        x="28.5"
        y="18.5"
        width="183"
        height="283"
        rx="92"
        fill="none"
        stroke="#F2DACE"
      />
    </svg>
  );
}

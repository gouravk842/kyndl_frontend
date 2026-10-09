"use client";

import { cn } from "@/lib/utils";

import { type PlaceholderSlug, placeholderSlug } from "./placeholder";

export function PlaceholderArt({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const slug = placeholderSlug(seed);
  return (
    <span
      className={cn("relative block size-full overflow-hidden", className)}
      aria-hidden
    >
      <svg
        viewBox="0 0 80 80"
        className="size-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="80" height="80" fill={wash(slug)} />
        {mark(slug)}
      </svg>
    </span>
  );
}

function wash(slug: PlaceholderSlug) {
  const washes: Record<PlaceholderSlug, string> = {
    fox: "#F4D3C4",
    hare: "#EFE0C8",
    swan: "#F7E7DA",
    dove: "#EED6C8",
    cat: "#E8C9B0",
    moon: "#F2D2A8",
    lantern: "#E8B89A",
    star: "#F0C9B2",
  };
  return washes[slug];
}

function mark(slug: PlaceholderSlug) {
  switch (slug) {
    case "fox":
      return (
        <>
          <path d="M18 54 L40 18 L62 54 Z" fill="#C75B39" />
          <path d="M28 54 L40 34 L52 54 Z" fill="#FFF7F1" />
          <circle cx="34" cy="46" r="2.2" fill="#3A2A25" />
          <circle cx="46" cy="46" r="2.2" fill="#3A2A25" />
        </>
      );
    case "hare":
      return (
        <>
          <ellipse cx="40" cy="50" rx="16" ry="14" fill="#8B5E3C" />
          <ellipse cx="32" cy="24" rx="5" ry="16" fill="#8B5E3C" />
          <ellipse cx="48" cy="24" rx="5" ry="16" fill="#8B5E3C" />
          <ellipse cx="32" cy="26" rx="2.4" ry="10" fill="#F2DACE" />
          <ellipse cx="48" cy="26" rx="2.4" ry="10" fill="#F2DACE" />
          <circle cx="34" cy="48" r="2" fill="#FFF7F1" />
          <circle cx="46" cy="48" r="2" fill="#FFF7F1" />
        </>
      );
    case "swan":
      return (
        <>
          <path
            d="M18 58 C28 38, 52 38, 64 56 C52 50, 30 52, 18 58 Z"
            fill="#FFF7F1"
          />
          <path d="M58 36 C64 28, 70 38, 62 44 Z" fill="#FFF7F1" />
          <circle cx="64" cy="36" r="2" fill="#3A2A25" />
          <path d="M66 37 L74 40 L66 42 Z" fill="#C75B39" />
        </>
      );
    case "dove":
      return (
        <>
          <ellipse cx="38" cy="44" rx="18" ry="12" fill="#FFF7F1" />
          <path d="M50 40 C66 28, 62 52, 48 48 Z" fill="#F2DACE" />
          <circle cx="26" cy="42" r="6" fill="#FFF7F1" />
          <circle cx="24" cy="41" r="1.6" fill="#3A2A25" />
          <path d="M18 42 L12 44 L18 46 Z" fill="#C75B39" />
        </>
      );
    case "cat":
      return (
        <>
          <circle cx="40" cy="46" r="16" fill="#3A2A25" />
          <path d="M26 36 L30 18 L38 34 Z" fill="#3A2A25" />
          <path d="M54 36 L50 18 L42 34 Z" fill="#3A2A25" />
          <path d="M30 20 L34 32 L38 34 Z" fill="#E07A5F" />
          <path d="M50 20 L46 32 L42 34 Z" fill="#E07A5F" />
          <circle cx="34" cy="46" r="2.4" fill="#F7ECE6" />
          <circle cx="46" cy="46" r="2.4" fill="#F7ECE6" />
          <path d="M40 50 L38 54 L42 54 Z" fill="#C75B39" />
        </>
      );
    case "moon":
      return (
        <>
          <circle cx="40" cy="40" r="18" fill="#F4E1B8" />
          <circle cx="48" cy="34" r="14" fill="#F2D2A8" />
          <circle cx="34" cy="36" r="2.4" fill="#D4A373" />
          <circle cx="30" cy="48" r="1.6" fill="#D4A373" />
        </>
      );
    case "lantern":
      return (
        <>
          <rect x="30" y="22" width="20" height="6" rx="2" fill="#8B5E3C" />
          <path d="M26 28 H54 L50 56 H30 Z" fill="#C75B39" />
          <rect x="32" y="34" width="16" height="14" rx="2" fill="#F4D3C4" />
          <path
            d="M40 16 C40 16, 40 22, 40 22"
            stroke="#8B5E3C"
            strokeWidth="2"
          />
          <circle cx="40" cy="15" r="3" fill="#D4A373" />
        </>
      );
    case "star":
      return (
        <>
          <path
            d="M40 16 L46 32 L64 34 L50 46 L54 62 L40 52 L26 62 L30 46 L16 34 L34 32 Z"
            fill="#C75B39"
          />
          <circle cx="40" cy="40" r="5" fill="#F4D3C4" />
        </>
      );
  }
}

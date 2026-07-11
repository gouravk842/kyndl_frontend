"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { AssetSlot } from "./asset-slot";

type PolaroidPhotoProps = {
  src?: string;
  alt?: string;
  caption?: string;
  /** "polaroid" gets a thick bottom border + caption; "single" is a plain print; "overlap" is for collages. */
  style?: "single" | "polaroid" | "overlap";
};

/**
 * A photo print that feels physically attached — drop shadow, slight paper
 * border, optional polaroid caption. Falls back to an asset slot if the image
 * file is missing.
 */
export function PolaroidPhoto({
  src,
  alt = "",
  caption,
  style = "polaroid",
}: PolaroidPhotoProps) {
  const [failed, setFailed] = useState(false);
  const isPolaroid = style === "polaroid";
  const showImage = src && !failed;

  return (
    <figure
      className={cn(
        "kyndl-pinned w-full select-none bg-white",
        isPolaroid ? "rounded-[3px] p-2 pb-0" : "rounded-[2px] p-1.5",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[#efe4d6]",
          isPolaroid ? "aspect-square" : "aspect-[4/3]",
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- local user-supplied assets; graceful onError fallback to a slot
          <img
            src={src}
            alt={alt}
            draggable={false}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <AssetSlot kind="photo" hint={src?.split("/").pop()} />
        )}
        {/* gloss */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/5"
        />
      </div>
      {isPolaroid && caption ? (
        <figcaption className="px-1 py-2 text-center font-hand text-lg leading-tight text-[#5b4034]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

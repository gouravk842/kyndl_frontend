"use client";

import { PlaceholderArt } from "@/features/memory-bank/lib/placeholder-art";
import { photoSrc } from "@/features/memory-bank/lib/preview";
import { cn } from "@/lib/utils";
import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

export function KeepsakeFace({
  src,
  seed,
  className,
}: {
  src?: string | null;
  seed: string;
  className?: string;
}) {
  return (
    <span className={cn("relative block size-full overflow-hidden", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- presigned or local preview
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <PlaceholderArt seed={seed} />
      )}
    </span>
  );
}

export function bankCoverSrc(circle: MemoryCircle): string | null {
  return circle.cover?.url ?? null;
}

export function memoryCoverSrc(memory: BankMemory): string | null {
  const photo = memory.photos[0];
  return photo ? photoSrc(photo) : null;
}

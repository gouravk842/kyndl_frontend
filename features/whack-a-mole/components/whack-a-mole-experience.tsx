"use client";

import dynamic from "next/dynamic";

import {
  WHACK_A_MOLE_CONFIG,
  type WhackAMoleConfig,
} from "@/features/whack-a-mole/config";

const WhackAMoleGame = dynamic(
  () => import("./whack-a-mole-game").then((m) => m.WhackAMoleGame),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-dvh place-items-center bg-[#fdf3ec]">
        <p className="animate-pulse font-display text-2xl text-[#C75B39]">
          warming up the moles…
        </p>
      </div>
    ),
  },
);

type Props = {
  config?: WhackAMoleConfig;
  /** Resolved media URLs keyed by fileId (face photo). */
  assets?: Record<string, string>;
  className?: string;
};

/**
 * Public / embed / preview entry. Resolves the face URL from `assets` (or
 * leaves null for the illustrated fallback), then mounts the arcade.
 */
export function WhackAMoleExperience({
  config = WHACK_A_MOLE_CONFIG,
  assets = {},
  className,
}: Props) {
  const faceUrl = config.face ? (assets[config.face.fileId] ?? null) : null;
  return (
    <WhackAMoleGame config={config} faceUrl={faceUrl} className={className} />
  );
}

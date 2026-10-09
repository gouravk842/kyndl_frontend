"use client";

import { ExperienceIcon } from "@/components/shared/experience-icon";
import {
  type ExperienceMedia,
  resolveExperienceMedia,
} from "@/lib/experience-media";
import { cn } from "@/lib/utils";

type ExperienceCardMediaProps = {
  /**
   * Experience slug — media is resolved from the central registry
   * (`lib/experiences` via `lib/experience-media`). Prefer this over hardcoding
   * image paths in callers.
   */
  slug: string;
  /** Optional overrides when the caller already has registry fields loaded. */
  media?: Partial<
    Pick<
      ExperienceMedia,
      "name" | "icon" | "previewImage" | "previewGradient" | "accent"
    >
  >;
  className?: string;
  /** Applied to the `<img>` (or the icon fallback container). */
  imgClassName?: string;
  /**
   * Overlay slot (status chips, icon badges). Positioned absolutely over the
   * media plane — keep badges inside this, not as siblings of the media.
   */
  children?: React.ReactNode;
  /** Show a soft bottom fade into the card body. */
  fade?: boolean;
};

/**
 * The single card-cover renderer for every experience surface. Always shows the
 * same `previewImage` for a given slug (gradient + icon fallback when none).
 */
export function ExperienceCardMedia({
  slug,
  media,
  className,
  imgClassName,
  children,
  fade = false,
}: ExperienceCardMediaProps) {
  const resolved = resolveExperienceMedia({ slug, ...media });

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        !className?.includes("aspect-") &&
          !className?.includes("h-") &&
          "aspect-[4/3]",
        className,
      )}
      style={{ background: resolved.previewGradient }}
      aria-hidden={children ? undefined : true}
    >
      {resolved.previewImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved.previewImage}
          alt=""
          className={cn(
            "absolute inset-0 size-full object-contain",
            imgClassName,
          )}
          draggable={false}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            imgClassName,
          )}
        >
          <ExperienceIcon
            name={resolved.icon}
            className="size-12 text-[#FF7A59]/45"
          />
        </div>
      )}

      {fade ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/40 to-transparent"
          aria-hidden
        />
      ) : null}

      {children}
    </div>
  );
}

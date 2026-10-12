"use client";

import { useReducedMotion } from "framer-motion";
import {
  type ImgHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useState,
} from "react";

import { ImageLightbox } from "@/components/ui/image-lightbox";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export type KeepsakeImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "children"
> & {
  src: string;
  alt?: string;
  /** Higher-res URL for the lightbox; falls back to `src`. */
  fullSrc?: string | null;
  /** Wrapper class (clipping / frame). */
  className?: string;
  /** Classes on the `<img>` itself. */
  imgClassName?: string;
  /** Sibling URLs for gallery navigation in the lightbox. */
  gallery?: string[];
  /** Index of this image within `gallery`. */
  galleryIndex?: number;
  /** Skip soft hover scale (e.g. mid-ceremony animation). */
  disableHoverScale?: boolean;
  /** When false, render a plain img with no zoom/lightbox. */
  enabled?: boolean;
  /**
   * Optional custom image node (e.g. `motion.img`). Must accept className
   * and forward pointer events. Click handling stays on the wrapper.
   */
  children?: ReactNode;
};

/**
 * Keepsake photo: soft desktop hover enlarge + click/tap full-bleed lightbox.
 * Safe to nest inside experience overlays — click stops propagation; Esc on the
 * lightbox is captured so parent modals stay open until the lightbox closes.
 */
export function KeepsakeImage({
  src,
  fullSrc,
  alt = "",
  className,
  imgClassName,
  gallery,
  galleryIndex = 0,
  disableHoverScale = false,
  enabled = true,
  children,
  onClick,
  ...imgProps
}: KeepsakeImageProps) {
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(galleryIndex);

  if (!src) return null;

  if (!enabled) {
    if (children) {
      return <div className={className}>{children}</div>;
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(className, imgClassName)}
        draggable={false}
        {...imgProps}
      />
    );
  }

  const lightboxSrc =
    gallery && gallery.length > 0
      ? (gallery[activeIndex] ?? fullSrc ?? src)
      : (fullSrc ?? src);

  const hoverScale =
    finePointer && !disableHoverScale && !reduce
      ? "group-hover/keepsake:scale-[1.04]"
      : "";

  function openLightbox(event: MouseEvent | KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex(galleryIndex);
    setOpen(true);
    if ("detail" in event) {
      onClick?.(event as MouseEvent<HTMLImageElement>);
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={alt ? `View larger: ${alt}` : "View larger photo"}
        onClick={openLightbox}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") openLightbox(event);
        }}
        className={cn(
          "group/keepsake relative block overflow-hidden border-0 bg-transparent p-0 text-left",
          finePointer && "cursor-zoom-in",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          className,
        )}
      >
        {children ? (
          <span
            className={cn(
              "relative block size-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              hoverScale,
              finePointer &&
                !disableHoverScale &&
                !reduce &&
                "group-hover/keepsake:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.35)]",
            )}
          >
            {children}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={cn(
              "size-full select-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              hoverScale,
              finePointer &&
                !disableHoverScale &&
                !reduce &&
                "group-hover/keepsake:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.35)]",
              imgClassName,
            )}
            {...imgProps}
          />
        )}
      </div>

      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        src={lightboxSrc}
        alt={alt}
        gallery={gallery}
        galleryIndex={activeIndex}
        onGalleryIndexChange={setActiveIndex}
      />
    </>
  );
}

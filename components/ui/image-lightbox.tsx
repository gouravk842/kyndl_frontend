"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export type ImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  /** Current image URL (prefer full-res when available). */
  src: string;
  alt?: string;
  /** Sibling URLs for gallery navigation. When provided with index, arrows/swipe work. */
  gallery?: string[];
  galleryIndex?: number;
  onGalleryIndexChange?: (index: number) => void;
};

/**
 * Full-bleed image lightbox for keepsake photos. Sits above experience overlays
 * (z-[100]). Esc closes this layer first so nested parent modals stay open.
 */
export function ImageLightbox({
  open,
  onClose,
  src,
  alt = "",
  gallery,
  galleryIndex = 0,
  onGalleryIndexChange,
}: ImageLightboxProps) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const items = gallery && gallery.length > 0 ? gallery : src ? [src] : [];
  const index = Math.min(
    Math.max(galleryIndex, 0),
    Math.max(items.length - 1, 0),
  );
  const currentSrc = items[index] ?? src;
  const hasGallery = items.length > 1;

  const go = useCallback(
    (delta: number) => {
      if (!hasGallery || !onGalleryIndexChange) return;
      const next = (index + delta + items.length) % items.length;
      onGalleryIndexChange(next);
    },
    [hasGallery, index, items.length, onGalleryIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    }
    // Capture so we win over parent overlay Esc handlers.
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose, go]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && currentSrc ? (
        <motion.div
          data-hud
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22, ease }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current == null || !hasGallery) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
            const dx = endX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) < 48) return;
            go(dx < 0 ? 1 : -1);
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Enlarged photo"}
            className="relative z-10 flex max-h-[min(92dvh,920px)] w-full max-w-[min(96vw,1100px)] flex-col items-center"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0 : 0.28, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute -top-1 right-0 z-20 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:-top-2 sm:-right-2"
            >
              <X className="size-5" strokeWidth={2} />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={currentSrc}
              src={currentSrc}
              alt={alt}
              draggable={false}
              className="max-h-[min(88dvh,880px)] w-auto max-w-full select-none rounded-sm object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            />

            {hasGallery ? (
              <div className="mt-3 flex items-center gap-3 text-sm text-white/80">
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => go(-1)}
                  className={cn(
                    "grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20",
                    "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
                  )}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <span className="min-w-[4.5rem] text-center tabular-nums">
                  {index + 1} / {items.length}
                </span>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => go(1)}
                  className={cn(
                    "grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20",
                    "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
                  )}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

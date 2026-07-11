"use client";

import {
  Coffee,
  EyeOff,
  type LucideIcon,
  MapPin,
  PartyPopper,
  Plane,
  Sparkles,
  X,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { CATEGORY_META, MOOD_COLORS, type Place, PLACES } from "../config";
import { useOurPlacesStore } from "../store";
import { SCENE_MS } from "./story-mode";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Plane,
  Coffee,
  PartyPopper,
  EyeOff,
};

/**
 * Reveal `text` one character at a time while `active`, paced so it finishes
 * comfortably inside a Story Mode scene. Typing pauses with playback (it reads
 * the live `isPlaying` so it doesn't need to resubscribe). Inactive → the full
 * text, immediately.
 */
function useTypewriter(text: string, active: boolean): string {
  const [typed, setTyped] = useState(text);
  useEffect(() => {
    if (!active) {
      setTyped(text);
      return;
    }
    setTyped("");
    const speed = Math.min(
      42,
      Math.max(14, Math.round((SCENE_MS - 1800) / Math.max(1, text.length))),
    );
    let i = 0;
    const id = setInterval(() => {
      if (!useOurPlacesStore.getState().isPlaying) return; // hold while paused
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active]);
  return typed;
}

type StoryCardProps = {
  /** The open place, or null when nothing is open. */
  place: Place | null;
  onClose: () => void;
};

/**
 * The memory reveal — the emotional core. Slides in from the right on desktop
 * and rises as a bottom sheet on mobile (the slide axis is chosen by responsive
 * transform utilities, so one element serves both). The element stays mounted
 * and slides off-screen when closed, so the exit animates too; it keeps showing
 * the last memory until it has fully slid away. Closes on ×, Escape, or a
 * map-background click (wired in the map). Warm paper tones and a handwritten
 * title keep it of-a-piece with the rest of Kyndl rather than a generic dialog.
 */
export function StoryCard({ place, onClose }: StoryCardProps) {
  const open = place !== null;
  // Hold the last shown place so the card keeps its content while it slides out.
  // Adjusting state during render (the sanctioned "derive from props" pattern)
  // keeps the latest non-null place without an effect.
  const [shown, setShown] = useState<Place | null>(place);
  if (place !== null && place !== shown) setShown(place);

  // Story Mode dresses the card up: the memory types itself out and the photo
  // gets a slow Ken Burns drift. (storyIndex === PLACES.length is the closing card.)
  const storyIndex = useOurPlacesStore((s) => s.storyIndex);
  const reduceMotion = useReducedMotion() ?? false;
  const inScene =
    storyIndex !== null && storyIndex < PLACES.length && open;
  const cinematic = inScene && !reduceMotion;
  const memory = useTypewriter(shown?.memory ?? "", cinematic);
  const typing = cinematic && memory.length < (shown?.memory.length ?? 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-hidden={!open}
      aria-label={shown ? `Memory: ${shown.title}` : undefined}
      // Touch/pointer events stay on the card so they don't pan the map beneath.
      onPointerDownCapture={(e) => e.stopPropagation()}
      className={[
        "absolute right-0 bottom-0 z-[1000] flex flex-col overflow-hidden bg-[#fefaf4] transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        // mobile: bottom sheet
        "h-[78%] w-full rounded-t-2xl shadow-[0_-8px_40px_rgba(58,42,37,0.22)]",
        // desktop: right rail
        "sm:top-0 sm:h-full sm:w-[360px] sm:rounded-none sm:shadow-[-8px_0_40px_rgba(58,42,37,0.18)]",
        open
          ? "translate-y-0 sm:translate-x-0"
          : "pointer-events-none translate-y-full sm:translate-x-full sm:translate-y-0",
      ].join(" ")}
    >
      {shown ? (
        <>
          {/* mobile drag-handle affordance */}
          <div className="flex justify-center pt-2 pb-1 sm:hidden">
            <span className="h-1.5 w-10 rounded-full bg-[#e3d2c5]" />
          </div>

          <div className="relative overflow-hidden">
            {shown.photo ? (
              <Image
                src={shown.photo}
                alt={shown.title}
                width={360}
                height={220}
                loading="lazy"
                className={`h-[200px] w-full object-cover sm:h-[220px] ${cinematic ? "op-kenburns" : ""}`}
              />
            ) : (
              <PhotoPlaceholder place={shown} cinematic={cinematic} />
            )}
            <button
              type="button"
              aria-label="Close memory card"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-[#fefaf4]/90 text-[#3a2a25] shadow-md outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge place={shown} />
              <span className="text-xs font-medium tracking-[0.18em] text-[#92786c] uppercase">
                {shown.date}
              </span>
            </div>

            <h2 className="font-hand mt-3 text-3xl leading-tight text-[#2a1f1f]">
              {shown.title}
            </h2>

            <p className="font-serif mt-3 text-[15px] leading-[1.75] whitespace-pre-line text-[#3d2f2f]">
              {cinematic ? memory : shown.memory}
              {typing ? (
                <span className="op-caret ml-0.5 inline-block align-baseline" aria-hidden>
                  |
                </span>
              ) : null}
            </p>

            <div className="mt-6 flex items-center gap-2 text-[13px] text-[#92786c]">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {shown.city}, {shown.country}
              </span>
            </div>
          </div>
        </>
      ) : null}
    </aside>
  );
}

function CategoryBadge({ place }: { place: Place }) {
  const meta = CATEGORY_META[place.category];
  const Icon = CATEGORY_ICONS[meta.icon] ?? Sparkles;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: meta.badgeBg, color: meta.badgeText }}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function PhotoPlaceholder({
  place,
  cinematic = false,
}: {
  place: Place;
  cinematic?: boolean;
}) {
  const meta = CATEGORY_META[place.category];
  const Icon = CATEGORY_ICONS[meta.icon] ?? Sparkles;
  const accent = MOOD_COLORS[place.mood];
  return (
    <div
      className={`flex h-[200px] w-full items-center justify-center sm:h-[220px] ${cinematic ? "op-kenburns" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${accent}22, ${accent}55)`,
      }}
    >
      <Icon className="h-12 w-12" style={{ color: meta.badgeText }} />
    </div>
  );
}

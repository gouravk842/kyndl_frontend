"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

import type { ModuleInteractionProps } from "@/features/unlocks";

import { MOOD_COLORS, MOOD_LABELS } from "../../types";
import type { MessageConfig } from "./index";

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The message reveal — a remembered moment sliding in over the city. This is the
 * `message` module's reward surface; the module-surface host mounts it when a
 * node's reward is opened. (Default export so it can be lazy-loaded.)
 */
export default function MessageInteraction({
  config,
  onClose,
}: ModuleInteractionProps<MessageConfig>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-20 flex items-stretch justify-end bg-black/45 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.aside
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-[#100d1f] text-white shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close memory"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative h-64 w-full shrink-0 overflow-hidden">
          {config.imageUrl ? (
            <Image
              src={config.imageUrl}
              alt={config.title}
              fill
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, ${MOOD_COLORS[config.mood]}55 0%, #100d1f 75%)`,
              }}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#100d1f] to-transparent" />
        </div>

        <div className="flex flex-col gap-4 px-7 pt-5 pb-10">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: MOOD_COLORS[config.mood] }}
            />
            <span className="text-xs tracking-[0.18em] text-white/60 uppercase">
              {MOOD_LABELS[config.mood]}
            </span>
          </div>

          <div>
            <h2 className="font-display text-3xl leading-tight">
              {config.title}
            </h2>
            {formatDate(config.date) && (
              <p className="mt-1 text-sm text-[#7fd9ff]">
                {formatDate(config.date)}
              </p>
            )}
          </div>

          <p className="text-base leading-relaxed text-white/80">
            {config.body}
          </p>

          {config.person && (
            <p className="text-sm text-white/55">
              With <span className="text-white/80">{config.person}</span>
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex h-11 w-fit items-center rounded-full border border-white/20 px-5 text-sm text-white/85 transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Keep exploring
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

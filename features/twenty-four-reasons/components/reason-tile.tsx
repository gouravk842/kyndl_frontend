"use client";

import { motion } from "framer-motion";
import { ImageIcon, Mic } from "lucide-react";
import { toast } from "sonner";

import { formatTarget } from "@/features/countdown/lib/time";

import type { Reason } from "../config";

/**
 * Envelope-style strip card for the archive under the day ring.
 */
export function ReasonTile({
  reason,
  open,
  isNew = false,
  onOpen,
}: {
  reason: Reason;
  open: boolean;
  isNew?: boolean;
  onOpen?: (reason: Reason) => void;
}) {
  const n = String(reason.n).padStart(2, "0");
  const lockedHint =
    reason.teaser.trim() ||
    (reason.unlockAt ? formatTarget(reason.unlockAt) : "sealed");

  return (
    <motion.button
      type="button"
      layout
      whileHover={open ? { y: -4, scale: 1.02 } : undefined}
      whileTap={open ? { scale: 0.98 } : undefined}
      onClick={() => {
        if (!open) {
          toast.message("Still sealed", { description: lockedHint });
          return;
        }
        onOpen?.(reason);
      }}
      className={[
        "group relative flex h-[7.5rem] w-[5.75rem] shrink-0 flex-col overflow-hidden rounded-md border text-left shadow-[0_10px_28px_rgba(90,50,35,0.12)] transition-shadow sm:h-32 sm:w-24",
        open
          ? "border-[#e8d5c4] bg-[#fffaf4] hover:shadow-[0_14px_32px_rgba(90,50,35,0.18)]"
          : "cursor-default border-[#d4a373]/45 bg-gradient-to-b from-[#f0dcc8] to-[#e2c4a8]",
        isNew && open
          ? "ring-2 ring-[#c75b39]/65 ring-offset-2 ring-offset-[#f6e6d6]"
          : "",
      ].join(" ")}
      aria-label={
        open
          ? `Open reason ${n}${isNew ? " (new)" : ""}`
          : `Reason ${n} sealed — ${lockedHint}`
      }
    >
      {/* Envelope flap */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-7 origin-top"
        style={{
          background: open
            ? "linear-gradient(180deg, #f5e6d6 0%, transparent 100%)"
            : "linear-gradient(180deg, #d4a373 0%, #c4905a 55%, transparent 100%)",
          clipPath: "polygon(0 0, 50% 70%, 100% 0)",
          opacity: open ? 0.55 : 0.9,
        }}
      />

      {!open ? (
        <span
          aria-hidden
          className="absolute top-[42%] left-1/2 z-[1] size-6 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #d44a5c, #8E1020 70%)",
            boxShadow: "0 2px 8px rgba(142,16,32,0.35)",
          }}
        >
          <span className="absolute inset-[3px] rounded-full border border-[#D4A373]/55" />
        </span>
      ) : null}

      <span className="relative z-[1] px-2 pt-2 font-hand text-[0.7rem] tracking-wide text-[#c75b39]">
        {n}
      </span>

      {open ? (
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-2 pb-2">
          <p className="line-clamp-3 text-[0.65rem] leading-snug text-[#5a433a]">
            {reason.message.trim() || "···"}
          </p>
          <span className="mt-auto flex items-center gap-1 pt-1 text-[#c75b39]/80">
            {reason.image?.fileId ? <ImageIcon className="size-3" /> : null}
            {reason.audio?.fileId ? <Mic className="size-3" /> : null}
          </span>
        </div>
      ) : (
        <p className="relative z-[1] mt-auto px-2 pb-2 text-[0.55rem] leading-tight text-[#8a6a4a]/90">
          {lockedHint}
        </p>
      )}
    </motion.button>
  );
}

"use client";

import { MessageCircle, Sparkles, Star, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Conversation } from "@/features/comments/components/conversation";
import { RecipientSheetFooter } from "@/features/recipient-aftermath/components/recipient-aftermath";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { cn } from "@/lib/utils";

type Panel = "review" | "comments" | null;

/**
 * Public layout for a shared memory-pages album.
 *
 * One warm backdrop runs the whole screen: a slim header floats on top with the
 * keepsake's name and the "How was it?" / "Comments" actions (which slide in as
 * sheets), the album floats in the middle with no caramel desk of its own, and
 * a friendly chat bubble waits in the corner. Hand-drawn doodles drift behind
 * everything so the page feels made-by-a-person, not machine-generated.
 */
export function MemoryPublicView({
  token,
  experienceType = "memory-pages",
  title,
  commentsEnabled,
  chatEnabled,
  reviewsEnabled,
  children,
}: {
  token: string;
  experienceType?: string;
  title: string;
  commentsEnabled: boolean;
  chatEnabled: boolean;
  reviewsEnabled: boolean;
  /** The rendered <AlbumViewer /> for this creation. */
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>(null);

  return (
    <div className="kyndl-mp-ambient relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <Doodles />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="relative z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-[#fdf3e6]/85 to-transparent px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#e9d7bf] bg-white/70 text-[#c75b39] shadow-sm">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-hand text-xs leading-none text-[#a06a44]">
              a keepsake for you
            </p>
            <p className="truncate font-cursive text-lg leading-tight text-[#4a3526]">
              {title}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {reviewsEnabled && (
            <PillButton icon={Star} onClick={() => setPanel("review")}>
              How was it?
            </PillButton>
          )}
          {commentsEnabled && (
            <PillButton
              icon={MessageCircle}
              onClick={() => setPanel("comments")}
            >
              <span className="hidden sm:inline">Comments</span>
              <span className="sm:hidden">Notes</span>
            </PillButton>
          )}
        </div>
      </header>

      {/* ── Album ──────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 pb-10">
        {children}
      </main>

      {/* ── Floating chat ──────────────────────────────────────────── */}
      {chatEnabled && <ChatDock token={token} />}

      {/* ── Review / Comments sheets ───────────────────────────────── */}
      <Sheet
        open={panel === "review"}
        onOpenChange={(open) => setPanel(open ? "review" : null)}
      >
        <FeedbackSheet eyebrow="How did this feel?" icon={Star}>
          <SheetTitle className="sr-only">How did this feel?</SheetTitle>
          <ReviewsSection
            type="experience"
            refId={token}
            title=""
            tone="keepsake"
            experienceType={experienceType}
          />
          <RecipientSheetFooter token={token} experienceType={experienceType} />
        </FeedbackSheet>
      </Sheet>

      {commentsEnabled && (
        <Sheet
          open={panel === "comments"}
          onOpenChange={(open) => setPanel(open ? "comments" : null)}
        >
          <FeedbackSheet eyebrow="The comments" icon={MessageCircle}>
            <SheetTitle className="sr-only">Comments</SheetTitle>
            <Conversation
              surface="experience"
              refId={token}
              title="Leave a note"
            />
          </FeedbackSheet>
        </Sheet>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Header pill button
   ───────────────────────────────────────────────────────────────────── */

function PillButton({
  icon: Icon,
  onClick,
  children,
}: {
  icon: typeof Star;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#e6d2ba] bg-white/80 px-3.5 py-2 text-sm font-medium text-[#5b4233] shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#3a2a25]"
    >
      <Icon className="size-4 text-[#c75b39]" />
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   The shared sheet shell for the review + comments panels
   ───────────────────────────────────────────────────────────────────── */

function FeedbackSheet({
  eyebrow,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  icon: typeof Star;
  children: ReactNode;
}) {
  return (
    <SheetContent
      side="right"
      className="w-full gap-0 border-l-[#e6d2ba] bg-[#fdf7ee] sm:max-w-md"
    >
      <div className="flex items-center gap-2 border-b border-[#f0e0cd] px-6 py-4">
        <span className="grid size-8 place-items-center rounded-full bg-[#ffe7dc] text-[#c75b39]">
          <Icon className="size-4" />
        </span>
        <span className="font-hand text-lg text-[#a06a44]">{eyebrow}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
    </SheetContent>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Floating chat dock
   ───────────────────────────────────────────────────────────────────── */

function ChatDock({ token }: { token: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end sm:right-6 sm:bottom-6">
      {open && (
        <div className="mb-3 flex max-h-[min(72vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-[#e6d2ba] bg-[#fffdf8] shadow-[0_28px_70px_-24px_rgba(74,53,38,0.55)]">
          <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="absolute top-3 right-3 z-10 grid size-7 place-items-center rounded-full text-[#8a6d52] transition-colors hover:bg-[#f4e6d4] hover:text-[#3a2a25]"
            >
              <X className="size-4" />
            </button>
            <Conversation
              surface="experience-chat"
              refId={token}
              title="Chat with the creator"
              className="pr-6"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Chat with the creator"}
        className="group relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff7a59] to-[#f2596f] text-white shadow-[0_14px_30px_-10px_rgba(242,89,111,0.7)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-white" />
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Background doodles — hand-drawn warmth, scattered and slowly drifting
   ───────────────────────────────────────────────────────────────────── */

function Doodles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Doodle
        className="top-24 left-[6%] size-10 text-[#f2596f]"
        delay="0s"
        rot={-8}
      >
        <HeartDoodle />
      </Doodle>
      <Doodle
        className="top-28 right-[9%] size-12 text-[#d4a373]"
        delay="1.4s"
        rot={10}
      >
        <StarDoodle />
      </Doodle>
      <Doodle
        className="top-1/2 left-[4%] size-9 text-[#ff7a59]"
        delay="0.7s"
        rot={6}
      >
        <SparkleDoodle />
      </Doodle>
      <Doodle
        className="top-[46%] right-[5%] size-11 text-[#e0a86b]"
        delay="2.1s"
        rot={-12}
      >
        <SwirlDoodle />
      </Doodle>
      <Doodle
        className="bottom-24 left-[10%] size-12 text-[#f0a13d]"
        delay="1s"
        rot={-4}
      >
        <SunDoodle />
      </Doodle>
      <Doodle
        className="bottom-16 left-1/2 size-10 text-[#c9976a]"
        delay="1.8s"
        rot={4}
      >
        <CameraDoodle />
      </Doodle>
    </div>
  );
}

function Doodle({
  children,
  className,
  delay,
  rot,
}: {
  children: ReactNode;
  className?: string;
  delay: string;
  rot: number;
}) {
  return (
    <span
      className={cn("kyndl-drift absolute block opacity-40", className)}
      style={{ animationDelay: delay, ["--r" as string]: `${rot}deg` }}
    >
      {children}
    </span>
  );
}

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HeartDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <path d="M16 27C7 21 4 15 6 10c1.7-4.3 7.3-4.6 10-.5 2.7-4.1 8.3-3.8 10 .5 2 5-1 11-10 17Z" />
    </svg>
  );
}

function StarDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <path d="M16 4l3.2 7.6L27 12l-6 5.4L22.6 26 16 21.6 9.4 26 11 17.4 5 12l7.8-.4L16 4Z" />
    </svg>
  );
}

function SparkleDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <path d="M16 3c0 7-2 10-9 10 7 0 9 3 9 10 0-7 2-10 9-10-7 0-9-3-9-10Z" />
    </svg>
  );
}

function SwirlDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <path d="M22 16a6 6 0 1 1-6-6c5 0 9 3 9 8s-4 9-11 9C7 25 3 20 3 14 3 8 8 3 15 3" />
    </svg>
  );
}

function SunDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <circle cx="16" cy="16" r="6" />
      <path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.5 6.5l2 2M23.5 23.5l2 2M25.5 6.5l-2 2M8.5 23.5l-2 2" />
    </svg>
  );
}

function CameraDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <path d="M4 11h5l2-3h10l2 3h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2Z" />
      <circle cx="16" cy="18" r="4.5" />
    </svg>
  );
}

"use client";

import { MessageCircle, Music, Sparkles, Star, VolumeX, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Conversation } from "@/features/comments/components/conversation";
import { RecipientSheetFooter } from "@/features/recipient-aftermath/components/recipient-aftermath";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { cn } from "@/lib/utils";

type Panel = "review" | "comments" | null;

/**
 * Public layout for a shared Memory Jar.
 *
 * One warm backdrop runs the whole screen. A slim header floats on top with the
 * keepsake's name, an autoplay toggle for the jar's music, and the "Review" /
 * "Comments" actions (which slide in as side sheets). The interactive jar floats
 * in the middle, a friendly chat bubble waits in the corner, and hand-drawn
 * doodles plus soft geometric shapes drift behind everything so the page feels
 * made-by-a-person, not machine-generated.
 *
 * The jar experience is rendered here with its own music disabled (the registry
 * passes `playMusic={false}`); this wrapper owns the single music control so it
 * can live in the header instead of colliding with the chat bubble.
 */
export function MemoryJarPublicView({
  token,
  experienceType = "memory-jar",
  title,
  commentsEnabled,
  chatEnabled,
  reviewsEnabled,
  musicUrl,
  children,
}: {
  token: string;
  experienceType?: string;
  title: string;
  commentsEnabled: boolean;
  chatEnabled: boolean;
  reviewsEnabled: boolean;
  /** Resolved URL for the jar's looping music, if it has any. */
  musicUrl?: string | null;
  /** The rendered <MemoryJarExperience /> for this creation. */
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>(null);

  return (
    <div className="kyndl-mp-ambient relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <GeoShapes />
      <Doodles />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="relative z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-[#fdf3e6]/85 to-transparent px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#e9d7bf] bg-white/70 text-[#c75b39] shadow-sm">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-hand text-xs leading-none text-[#a06a44]">
              a jar of notes for you
            </p>
            <p className="truncate font-cursive text-lg leading-tight text-[#4a3526]">
              {title}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {musicUrl && <MusicToggle src={musicUrl} />}
          {reviewsEnabled && (
            <PillButton icon={Star} onClick={() => setPanel("review")}>
              <span className="hidden sm:inline">How was it?</span>
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

      {/* ── Jar ────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 pb-10 pt-2">
        {children}
      </main>

      {/* ── Floating chat ──────────────────────────────────────────── */}
      {chatEnabled && <ChatDock token={token} />}

      {/* ── Review / Comments sheets ───────────────────────────────── */}
      {reviewsEnabled && (
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
            <RecipientSheetFooter
              token={token}
              experienceType={experienceType}
            />
          </FeedbackSheet>
        </Sheet>
      )}

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
   Music autoplay toggle
   ───────────────────────────────────────────────────────────────────── */

function MusicToggle({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // Try to start on mount; browsers that block autoplay leave it paused and the
  // button becomes a one-tap "play".
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-[#e6d2ba] bg-white/80 px-3 py-2 text-sm font-medium text-[#5b4233] shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#3a2a25]",
          playing && "border-[#f4bfa8] bg-[#ffe7dc]/80 text-[#c75b39]",
        )}
      >
        {playing ? (
          <Music className="size-4 animate-pulse text-[#c75b39]" />
        ) : (
          <VolumeX className="size-4 text-[#c75b39]" />
        )}
        <span className="hidden sm:inline">{playing ? "Playing" : "Play"}</span>
      </button>
    </>
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
   Background geometry — soft floating shapes for a little depth
   ───────────────────────────────────────────────────────────────────── */

function GeoShapes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* big soft blobs */}
      <span
        className="kyndl-drift absolute -top-16 -left-16 size-64 rounded-full bg-[#ffd9c2]/40 blur-3xl"
        style={{ animationDelay: "0.3s", ["--r" as string]: "0deg" }}
      />
      <span
        className="kyndl-drift absolute -right-20 top-1/3 size-72 rounded-full bg-[#f7c9d3]/35 blur-3xl"
        style={{ animationDelay: "1.6s", ["--r" as string]: "0deg" }}
      />
      <span
        className="kyndl-drift absolute -bottom-24 left-1/4 size-72 rounded-full bg-[#f5e0b8]/40 blur-3xl"
        style={{ animationDelay: "1s", ["--r" as string]: "0deg" }}
      />

      {/* crisp outlined shapes */}
      <span
        className="kyndl-drift absolute left-[8%] top-[30%] size-8 rounded-full border-2 border-[#e0a86b]/50"
        style={{ animationDelay: "0.9s", ["--r" as string]: "0deg" }}
      />
      <span
        className="kyndl-drift absolute right-[12%] top-[22%] size-6 rotate-45 border-2 border-[#f2596f]/40"
        style={{ animationDelay: "2.2s", ["--r" as string]: "45deg" }}
      />
      <span
        className="kyndl-drift absolute right-[16%] bottom-[26%] size-9 border-2 border-[#ff7a59]/40"
        style={{ animationDelay: "0.5s", ["--r" as string]: "12deg" }}
      />
      <span
        className="kyndl-drift absolute left-[14%] bottom-[20%] size-0"
        style={{
          animationDelay: "1.9s",
          ["--r" as string]: "-6deg",
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderBottom: "26px solid rgba(224,168,107,0.4)",
        }}
      />
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
        className="bottom-16 right-[14%] size-10 text-[#c9976a]"
        delay="1.8s"
        rot={4}
      >
        <EnvelopeDoodle />
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

function EnvelopeDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <rect x="4" y="8" width="24" height="18" rx="2" />
      <path d="M4 10l12 9 12-9" />
    </svg>
  );
}

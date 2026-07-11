"use client";

import { MessageCircle, Star } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Conversation } from "@/features/comments/components/conversation";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";

type Panel = "review" | "comments" | "chat" | null;

/**
 * Public layout for a shared Our Places map. The read-only map (with its guided
 * tour) fills the screen; the audience-interaction surfaces the owner switched on
 * float on top — "Review" / "Comments" pills top-right and a chat bubble bottom-
 * left — each opening an on-theme side sheet. Mirrors the memory-pages public
 * layout so feedback is reachable without scrolling a full-screen map off-view.
 */
export function OurPlacesPublicView({
  token,
  commentsEnabled,
  reviewsEnabled,
  chatEnabled,
  children,
}: {
  token: string;
  commentsEnabled: boolean;
  reviewsEnabled: boolean;
  chatEnabled: boolean;
  /** The rendered read-only map for this creation. */
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>(null);

  return (
    // `isolate` scopes the map's Leaflet-era z-[600..700] overlays to their own
    // stacking context so the body-level sheet portal (z-50) still lands on top.
    <div className="relative isolate h-dvh w-full overflow-hidden bg-[#fdf3ec]">
      <div className="absolute inset-0">{children}</div>

      {/* Review / Comments pills — top-right, clear of the map's title (top-left). */}
      {(reviewsEnabled || commentsEnabled) && (
        <div className="absolute top-5 right-5 z-[700] flex items-center gap-2">
          {reviewsEnabled && (
            <PillButton icon={Star} onClick={() => setPanel("review")}>
              Review
            </PillButton>
          )}
          {commentsEnabled && (
            <PillButton icon={MessageCircle} onClick={() => setPanel("comments")}>
              <span className="hidden sm:inline">Comments</span>
              <span className="sm:hidden">Notes</span>
            </PillButton>
          )}
        </div>
      )}

      {/* Chat bubble — bottom-left, away from the tour bar (centre) and card (right). */}
      {chatEnabled && (
        <button
          type="button"
          aria-label="Chat with the creator"
          onClick={() => setPanel("chat")}
          className="absolute bottom-5 left-5 z-[700] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] py-2.5 pr-5 pl-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_-12px_rgba(242,89,111,0.7)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="grid size-6 place-items-center rounded-full bg-white/25">
            <MessageCircle className="size-3.5" />
          </span>
          Chat
        </button>
      )}

      <Sheet
        open={panel !== null}
        onOpenChange={(open) => setPanel(open ? panel : null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-[#fffaf4] sm:max-w-md"
        >
          {/* The visible heading comes from each section below; this keeps the
              dialog labelled for screen readers. */}
          <SheetTitle className="sr-only">
            {panel === "review"
              ? "Rate this map"
              : panel === "comments"
                ? "Comments"
                : "Chat with the creator"}
          </SheetTitle>

          {panel === "review" && (
            <ReviewsSection type="experience" refId={token} title="Rate this map" />
          )}
          {panel === "comments" && (
            <Conversation surface="experience" refId={token} />
          )}
          {panel === "chat" && (
            <Conversation
              surface="experience-chat"
              refId={token}
              title="Chat with the creator"
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

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
      className="inline-flex items-center gap-1.5 rounded-full border border-[#f2dace]/70 bg-[#fff7f1]/90 px-3.5 py-2 text-sm font-semibold text-[#3a2a25] shadow-[0_6px_18px_-10px_rgba(58,42,37,0.5)] backdrop-blur-md outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
    >
      <Icon className="size-4 text-[#c75b39]" />
      {children}
    </button>
  );
}

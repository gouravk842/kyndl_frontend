"use client";

import { useEffect } from "react";

import { Conversation } from "@/features/comments/components/conversation";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { track } from "@/services/analytics/analytics.service";

import { MakeOneBackCta } from "./make-one-back-cta";

/**
 * Post-receive growth loop on `/v/<token>`:
 * 1. Ask for a recipient reaction → UGC (reviews, soft copy + marketing consent)
 * 2. Soft "make one back" CTA
 * 3. Companion recs → occasion reminder later (`captureOccasionReminderIntent`)
 *
 * Comments / chat stay below when the owner left them on.
 */
export function RecipientAftermath({
  token,
  experienceType,
  reviewsEnabled,
  commentsEnabled,
  chatEnabled,
  published,
}: {
  token: string;
  experienceType: string;
  reviewsEnabled: boolean;
  commentsEnabled: boolean;
  chatEnabled: boolean;
  /** Draft previews are viewable by the owner, but reviews and comments only
   * exist once the keepsake is published. */
  published: boolean;
}) {
  const showReaction = reviewsEnabled && published;
  const showAnything =
    showReaction || commentsEnabled || chatEnabled || Boolean(experienceType);

  useEffect(() => {
    if (!showReaction) return;
    track({
      name: "share.reaction_prompt_shown",
      properties: { experience_type: experienceType, from_token: token },
    });
  }, [showReaction, experienceType, token]);

  if (!showAnything) return null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-12 px-6 py-14">
      {showReaction && (
        <div className="space-y-3">
          <p className="font-display text-2xl text-foreground">
            How did this feel?
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            A star and a few words help the person who made this — and help
            Kyndl show others what a keepsake can feel like.
          </p>
          <ReviewsSection
            type="experience"
            refId={token}
            title=""
            tone="keepsake"
            experienceType={experienceType}
          />
        </div>
      )}

      <MakeOneBackCta experienceType={experienceType} fromToken={token} />

      {!published && (reviewsEnabled || commentsEnabled || chatEnabled) && (
        <p className="text-sm text-muted-foreground">
          Notes and reactions open once this is published.
        </p>
      )}

      {commentsEnabled && published && (
        <Conversation surface="experience" refId={token} title="Leave a note" />
      )}

      {chatEnabled && published && (
        <Conversation
          surface="experience-chat"
          refId={token}
          title="Chat with the creator"
        />
      )}
    </div>
  );
}

/**
 * Compact block for themed sheets (memory pages / jar / our-places): soft
 * reaction copy + make-one-back under the existing ReviewsSection.
 */
export function RecipientSheetFooter({
  token,
  experienceType,
}: {
  token: string;
  experienceType: string;
}) {
  return (
    <div className="mt-8 border-t border-border/60 pt-6">
      <MakeOneBackCta
        experienceType={experienceType}
        fromToken={token}
        tone="on-warm"
      />
    </div>
  );
}

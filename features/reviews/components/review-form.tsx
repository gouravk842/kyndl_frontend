"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Review, ReviewInput } from "@/types/review";

import { StarRatingInput } from "./star-rating";

interface ReviewFormProps {
  /** The viewer's existing review, if any — edits it in place. */
  existing?: Review | null;
  submitting?: boolean;
  onSubmit: (input: ReviewInput) => void;
  /**
   * `keepsake` softens product-review copy for recipient reactions on `/v`
   * and shows the marketing-UGC consent checkbox.
   */
  tone?: "default" | "keepsake";
}

const MAX_BODY = 2000;

/** The write surface: pick a rating, add an optional title + body, submit. */
export function ReviewForm({
  existing,
  submitting,
  onSubmit,
  tone = "default",
}: ReviewFormProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [allowMarketing, setAllowMarketing] = useState(
    existing?.allow_marketing_use ?? false,
  );

  const isEditing = Boolean(existing);
  const canSubmit = rating >= 1 && !submitting;
  const keepsake = tone === "keepsake";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      rating,
      title: title.trim(),
      body: body.trim(),
      allow_marketing_use: keepsake ? allowMarketing : false,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          {keepsake
            ? isEditing
              ? "Update how it felt"
              : "Tap a star"
            : isEditing
              ? "Update your review"
              : "Write a review"}
        </span>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={submitting}
        />
      </div>

      <Input
        placeholder={
          keepsake ? "A short headline (optional)" : "Add a headline (optional)"
        }
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        disabled={submitting}
      />

      <div className="space-y-1">
        <textarea
          placeholder={
            keepsake
              ? "A few words, if you want — what stayed with you?"
              : "Share your honest experience — what did you love, what could be better?"
          }
          value={body}
          maxLength={MAX_BODY}
          rows={keepsake ? 3 : 4}
          onChange={(e) => setBody(e.target.value)}
          disabled={submitting}
          className={cn(
            "w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        />
        <div className="text-right text-xs text-muted-foreground">
          {body.length}/{MAX_BODY}
        </div>
      </div>

      {keepsake && (
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={allowMarketing}
            onChange={(e) => setAllowMarketing(e.target.checked)}
            disabled={submitting}
            className="mt-0.5 size-4 shrink-0 rounded border-input"
          />
          <span>
            Kyndl may share this anonymously so others can feel what a keepsake
            is like.
          </span>
        </label>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={!canSubmit}>
          {submitting
            ? "Saving…"
            : isEditing
              ? keepsake
                ? "Update"
                : "Update review"
              : keepsake
                ? "Share how it felt"
                : "Post review"}
        </Button>
        {rating === 0 && (
          <span className="text-xs text-muted-foreground">
            {keepsake
              ? "Pick a star to continue."
              : "Pick a star rating to continue."}
          </span>
        )}
      </div>
    </form>
  );
}

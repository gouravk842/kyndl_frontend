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
}

const MAX_BODY = 2000;

/** The write surface: pick a rating, add an optional title + body, submit. */
export function ReviewForm({ existing, submitting, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");

  const isEditing = Boolean(existing);
  const canSubmit = rating >= 1 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ rating, title: title.trim(), body: body.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          {isEditing ? "Update your review" : "Write a review"}
        </span>
        <StarRatingInput value={rating} onChange={setRating} disabled={submitting} />
      </div>

      <Input
        placeholder="Add a headline (optional)"
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        disabled={submitting}
      />

      <div className="space-y-1">
        <textarea
          placeholder="Share your honest experience — what did you love, what could be better?"
          value={body}
          maxLength={MAX_BODY}
          rows={4}
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

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={!canSubmit}>
          {submitting ? "Saving…" : isEditing ? "Update review" : "Post review"}
        </Button>
        {rating === 0 && (
          <span className="text-xs text-muted-foreground">Pick a star rating to continue.</span>
        )}
      </div>
    </form>
  );
}

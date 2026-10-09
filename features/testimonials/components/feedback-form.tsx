"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { StarRatingInput } from "@/features/reviews/components/star-rating";
import { featuredExperiences } from "@/lib/experiences";
import { cn } from "@/lib/utils";
import { testimonialService } from "@/services/testimonials/testimonial.service";

const MAX_COMMENT = 1000;

const experienceOptions = featuredExperiences.map((e) => ({
  slug: e.slug,
  name: e.name,
}));

/**
 * Public feedback portal form. Submissions are stored as *pending* until an
 * admin approves them for the homepage carousel.
 */
export function FeedbackForm() {
  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [experienceSlug, setExperienceSlug] = useState(
    experienceOptions[0]?.slug ?? "",
  );
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const exp =
        experienceOptions.find((e) => e.slug === experienceSlug) ??
        experienceOptions[0];
      if (!exp) throw new Error("Pick an experience.");
      return testimonialService.submit({
        display_name: displayName.trim(),
        rating,
        comment: comment.trim(),
        experience_slug: exp.slug,
        experience_name: exp.name,
      });
    },
    onSuccess: () => {
      setDone(true);
      setError(null);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Something went wrong. Please try again.";
      setError(msg);
    },
  });

  if (done) {
    return (
      <div className="rounded-3xl border border-[#F4DDD0] bg-white px-8 py-12 text-center kyndl-card-soft">
        <p className="font-display text-2xl text-[#3A2A25]">Thank you.</p>
        <p className="mt-3 text-[#7A6258]">
          Your feedback is with us — once reviewed, it may appear on the home
          page.
        </p>
      </div>
    );
  }

  const canSubmit =
    displayName.trim().length > 0 &&
    rating >= 1 &&
    comment.trim().length >= 8 &&
    Boolean(experienceSlug) &&
    !mutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        mutation.mutate();
      }}
      className="kyndl-card-soft space-y-6 rounded-3xl border border-[#F4DDD0] bg-white p-7 sm:p-9"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#3A2A25]">
          Your name
        </label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
          placeholder="First name or initials"
          className={inputCls}
          disabled={mutation.isPending}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#3A2A25]">
          Experience
        </label>
        <select
          value={experienceSlug}
          onChange={(e) => setExperienceSlug(e.target.value)}
          className={inputCls}
          disabled={mutation.isPending}
          required
        >
          {experienceOptions.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-[#3A2A25]">
          Rating
        </span>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={mutation.isPending}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#3A2A25]">
          Your comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={MAX_COMMENT}
          rows={5}
          placeholder="What happened when they opened it?"
          className={cn(inputCls, "min-h-[120px] resize-y")}
          disabled={mutation.isPending}
          required
        />
        <p className="mt-1 text-right text-xs text-[#92786C]">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-[#C21830]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-base font-medium text-white transition-all duration-300",
          "kyndl-glow-warm hover:-translate-y-0.5",
          "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
        )}
      >
        {mutation.isPending ? "Sending…" : "Send feedback"}
      </button>

      <p className="text-center text-xs text-[#92786C]">
        We review every note before it appears on the site.
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#F2DACE] bg-[#FFF7F1]/60 px-4 py-3 text-sm text-[#3A2A25] outline-none transition-colors placeholder:text-[#B08C7D] focus:border-[#FF7A59]/50 focus:ring-2 focus:ring-[#FF7A59]/15 disabled:opacity-50";

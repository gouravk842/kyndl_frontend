"use client";

import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import { ideaService } from "@/services/ideas/idea.service";
import { useAuthStore } from "@/store/auth.store";
import type { IdeaSource } from "@/types/idea";

const MAX_IDEA = 2000;

const COPY: Record<IdeaSource, { title: string; lede: string }> = {
  homepage: {
    title: "Tell us what you were hoping to unwrap.",
    lede: "If it isn't on the shelf, leave the idea here. We'll try to figure it out, so you don't have to go looking somewhere else.",
  },
  experiences: {
    title: "None of these is the one?",
    lede: "You looked through every world. If yours isn't here, describe the moment you wanted. We'll try to figure it out.",
  },
  gifts: {
    title: "Tell us what you were hoping to unwrap.",
    lede: "If it isn't on the shelf, leave the idea here. We'll try to figure it out, so you don't have to go looking somewhere else.",
  },
  games: {
    title: "Want a game we don't have yet?",
    lede: "Describe the night you had in mind. We'll try to figure it out.",
  },
  recommend: {
    title: "None of these quite fits?",
    lede: "Tell us the thing you actually came for. We'll try to figure it out.",
  },
  feedback: {
    title: "Looking for something we don't have?",
    lede: "The note above is for a moment you've already felt. This is for the one you wish existed. We'll try to figure it out.",
  },
};

type Variant = "inset" | "band" | "card";

/**
 * Collects a requirement when nothing on the shelf fits, with an honest
 * promise: we'll try to figure it out. Lives on its own page; other surfaces
 * link here instead of embedding the form.
 */
export function SubmitIdea({
  source,
  variant = "card",
  anchorId,
  seed = "",
  contextLine,
}: {
  source: IdeaSource;
  variant?: Variant;
  /** Optional anchor so in-page links can land on the form. */
  anchorId?: string;
  /** Prefill from a search that found nothing. */
  seed?: string;
  /** A line above the title, e.g. the search that missed. */
  contextLine?: string;
}) {
  const copy = COPY[source];
  const headingId = useId();
  const [doneEmail, setDoneEmail] = useState<string | null>(null);

  const form = (
    <IdeaForm
      source={source}
      seed={seed}
      compact={variant === "card"}
      onDone={(email) => setDoneEmail(email)}
    />
  );

  if (doneEmail !== null) {
    const thanks = (
      <ThankYou
        emailLeft={doneEmail.length > 0}
        compact={variant === "card"}
        headingId={headingId}
      />
    );
    if (variant === "card") return thanks;
    return (
      <Wrap variant={variant} anchorId={anchorId} headingId={headingId}>
        <PageContainer size="md">{thanks}</PageContainer>
      </Wrap>
    );
  }

  if (variant === "card") {
    return (
      <div className="rounded-3xl border border-[#F4DDD0] bg-white p-7 kyndl-card-soft sm:p-9">
        {contextLine ? (
          <p className="text-sm font-medium text-[#C75B39]">{contextLine}</p>
        ) : null}
        <h2
          id={headingId}
          className={cn(
            "font-display text-2xl text-[#3A2A25]",
            contextLine && "mt-2",
          )}
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
          {copy.lede}
        </p>
        <div className="mt-6">{form}</div>
      </div>
    );
  }

  return (
    <Wrap variant={variant} anchorId={anchorId} headingId={headingId}>
      <PageContainer size="xl">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
              <Sparkles className="size-3.5" aria-hidden />
              Submit your ideas
            </p>
            {contextLine ? (
              <p className="mt-4 text-sm font-medium text-[#C75B39]">
                {contextLine}
              </p>
            ) : null}
            <h2
              id={headingId}
              className="mt-4 font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl"
            >
              {copy.title}
            </h2>
            <p className="mt-4 max-w-md text-[#7A6258]">{copy.lede}</p>
            <ul className="mt-6 space-y-2 text-sm text-[#7A6258]">
              <li>Tell us the moment, the gift, or the game.</li>
              <li>We’ll sit with it and try.</li>
              <li>
                Leave an email if you’d like to hear when there’s something to
                show.
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[#F4DDD0] bg-white p-7 kyndl-card-soft sm:p-9">
            {form}
          </div>
        </div>
      </PageContainer>
    </Wrap>
  );
}

function Wrap({
  variant,
  anchorId,
  headingId,
  children,
}: {
  variant: Variant;
  anchorId?: string;
  headingId: string;
  children: ReactNode;
}) {
  if (variant === "band") {
    return (
      <section
        id={anchorId}
        aria-labelledby={headingId}
        className="relative scroll-mt-24 overflow-hidden border-y border-[#F2DACE] bg-[#FFF7F1] py-20 md:py-28"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 12% 20%, rgba(255,160,120,0.22) 0%, transparent 70%), radial-gradient(ellipse 45% 35% at 90% 80%, rgba(242,89,111,0.14) 0%, transparent 72%)",
          }}
          aria-hidden
        />
        <div className="relative">{children}</div>
      </section>
    );
  }

  return (
    <div id={anchorId} className="scroll-mt-24">
      {children}
    </div>
  );
}

function ThankYou({
  emailLeft,
  compact,
  headingId,
}: {
  emailLeft: boolean;
  compact: boolean;
  headingId: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#F4DDD0] bg-white text-center kyndl-card-soft",
        compact ? "px-7 py-10" : "px-8 py-14",
      )}
      role="status"
    >
      <p id={headingId} className="font-display text-2xl text-[#3A2A25]">
        We have it.
      </p>
      <p className="mx-auto mt-3 max-w-md text-[#7A6258]">
        We’ll try to figure this out.
        {emailLeft
          ? " You left a way to reach you — we’ll write when there’s something to show."
          : " When we make it real, it’ll be waiting here."}
      </p>
    </div>
  );
}

function IdeaForm({
  source,
  seed,
  compact,
  onDone,
}: {
  source: IdeaSource;
  seed: string;
  compact: boolean;
  onDone: (email: string) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.isHydrated);
  const prefilled = useRef(false);
  const lastSeed = useRef(seed);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState(seed);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIdea((current) =>
      current === "" || current === lastSeed.current ? seed : current,
    );
    lastSeed.current = seed;
  }, [seed]);

  useEffect(() => {
    if (!hydrated || !user || prefilled.current) return;
    prefilled.current = true;
    setName((current) => current || user.full_name || user.first_name || "");
    setEmail((current) => current || user.email || "");
  }, [hydrated, user]);

  const mutation = useMutation({
    mutationFn: () =>
      ideaService.submit({
        display_name: name.trim(),
        email: email.trim(),
        idea: idea.trim(),
        source,
        company_website: companyWebsite,
      }),
    onSuccess: () => {
      setError(null);
      track({
        name: "idea.submitted",
        properties: { source, has_email: Boolean(email.trim()) },
      });
      onDone(email.trim());
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Something went wrong. Please try again.";
      setError(msg);
    },
  });

  const canSubmit =
    name.trim().length > 0 && idea.trim().length >= 12 && !mutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        mutation.mutate();
      }}
      className="relative space-y-5"
    >
      <div
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden
      >
        <label>
          Company website
          <input
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            name="company_website"
          />
        </label>
      </div>

      <div>
        <label
          htmlFor={`idea-${source}`}
          className="mb-1.5 block text-sm font-medium text-[#3A2A25]"
        >
          What were you hoping to find?
        </label>
        <textarea
          id={`idea-${source}`}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          maxLength={MAX_IDEA}
          rows={compact ? 4 : 5}
          placeholder="A scrapbook that plays our voice notes. A Tuesday-night game for long distance. A gift I can't find anywhere…"
          className={cn(inputCls, "min-h-[110px] resize-y")}
          disabled={mutation.isPending}
          required
        />
        <p className="mt-1 text-right text-xs text-[#92786C]">
          {idea.length}/{MAX_IDEA}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`idea-name-${source}`}
            className="mb-1.5 block text-sm font-medium text-[#3A2A25]"
          >
            Your name
          </label>
          <input
            id={`idea-name-${source}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoComplete="name"
            placeholder="What should we call you?"
            className={inputCls}
            disabled={mutation.isPending}
            required
          />
        </div>
        <div>
          <label
            htmlFor={`idea-email-${source}`}
            className="mb-1.5 block text-sm font-medium text-[#3A2A25]"
          >
            Email <span className="font-normal text-[#92786C]">optional</span>
          </label>
          <input
            id={`idea-email-${source}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="So we can write back"
            className={inputCls}
            disabled={mutation.isPending}
          />
        </div>
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
        {mutation.isPending ? "Sending…" : "Send it — we'll try"}
      </button>

      <p className="text-center text-xs text-[#92786C]">
        We’ll try to figure it out. Every idea is read.
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#F2DACE] bg-[#FFF7F1]/60 px-4 py-3 text-sm text-[#3A2A25] outline-none transition-colors placeholder:text-[#B08C7D] focus:border-[#FF7A59]/50 focus:ring-2 focus:ring-[#FF7A59]/15 disabled:opacity-50";

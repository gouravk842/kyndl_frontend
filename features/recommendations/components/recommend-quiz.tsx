"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ideaHref } from "@/features/ideas/idea-href";
import { RecommendationRail } from "@/features/recommendations/components/recommendation-rail";
import { hasRedZoneConsent, setRedZoneConsent } from "@/lib/red-zone-consent";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import { recommendationService } from "@/services/recommendations/recommendation.service";
import type {
  BudgetTier,
  ChannelPref,
  GiftSize,
  Occasion,
  QuizAnswers,
  RecommendationItem,
  Timeline,
  Vibe,
} from "@/types/recommendation";

/** Three steps only — longer funnels drop off hard. */
type StepId = "occasion" | "vibe" | "details";

const STEPS: StepId[] = ["occasion", "vibe", "details"];

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "just_because", label: "Just because" },
  { value: "valentine", label: "Valentine" },
  { value: "proposal", label: "Proposal" },
  { value: "first_date", label: "First date" },
];

const VIBES: { value: Vibe; label: string }[] = [
  { value: "romantic", label: "Romantic" },
  { value: "playful", label: "Playful" },
  { value: "sentimental", label: "Sentimental" },
  { value: "adventurous", label: "Adventurous" },
  { value: "intimate", label: "Intimate (18+)" },
];

const CHANNELS: { value: ChannelPref; label: string }[] = [
  { value: "either", label: "Both" },
  { value: "digital", label: "Digital" },
  { value: "physical", label: "Physical" },
];

const BUDGETS: { value: BudgetTier; label: string }[] = [
  { value: "under_299", label: "Under ₹299" },
  { value: "299_799", label: "₹299–₹799" },
  { value: "799_1499", label: "₹799–₹1,499" },
  { value: "1500_plus", label: "₹1,500+" },
];

const TIMELINES: { value: Timeline; label: string }[] = [
  { value: "tonight", label: "Tonight" },
  { value: "this_week", label: "This week" },
  { value: "planned", label: "Later" },
];

function giftSizeFromBudget(tier?: BudgetTier | ""): GiftSize {
  if (tier === "under_299") return "small_gesture";
  if (tier === "1500_plus" || tier === "799_1499") return "grand";
  return "medium";
}

function stepCopy(step: StepId): { title: string; subtitle: string } {
  switch (step) {
    case "occasion":
      return {
        title: "What's the moment?",
        subtitle: "Three quick questions — then your picks.",
      };
    case "vibe":
      return {
        title: "What should it feel like?",
        subtitle: "We'll match the mood.",
      };
    case "details":
      return {
        title: "A few practicals",
        subtitle: "Channel, budget, and when.",
      };
  }
}

export function RecommendQuiz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    channel_pref: "either",
    timeline: "this_week",
    recipient_interests: [],
    adult_ok: false,
  });
  const [results, setResults] = useState<RecommendationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const step = STEPS[stepIndex]!;
  const copy = stepCopy(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canContinue = useMemo(() => {
    if (step === "occasion") return Boolean(answers.occasion);
    if (step === "vibe") return Boolean(answers.vibe);
    return Boolean(
      answers.channel_pref && answers.budget_tier && answers.timeline,
    );
  }, [answers, step]);

  const submit = () => {
    setError(null);
    const adult_ok = answers.vibe === "intimate" || Boolean(answers.adult_ok);
    startTransition(async () => {
      try {
        if (adult_ok) setRedZoneConsent();
        const payload: QuizAnswers = {
          ...answers,
          adult_ok: adult_ok || hasRedZoneConsent(),
          gift_size: giftSizeFromBudget(answers.budget_tier),
          limit: 12,
        };
        const res = await recommendationService.quiz(payload);
        setResults(res.results);
        track({
          name: "recommendation.quiz_completed",
          properties: {
            occasion: answers.occasion,
            channel_pref: answers.channel_pref,
            result_count: res.results.length,
            steps: STEPS.length,
          },
        });
      } catch {
        setError("Something went wrong — try again in a moment.");
      }
    });
  };

  if (results) {
    return (
      <div className="relative min-h-[70dvh]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#FDEBE6_0%,_transparent_55%),linear-gradient(180deg,#FFF8F4_0%,#F5E9E2_100%)]" />
        <PageContainer size="xl" className="relative py-14 md:py-20">
          <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            For the two of you
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl text-[#3A2A25] md:text-5xl">
            Your picks
          </h1>
          <p className="mt-3 max-w-xl text-[#7A6258]">
            Digital keepsakes and physical gifts matched to what you told us.
          </p>
          <RecommendationRail
            title="Matched for you"
            items={results}
            context="quiz"
            className="mt-10"
          />
          <Button
            variant="ghost"
            className="mt-8"
            onClick={() => {
              setResults(null);
              setStepIndex(0);
            }}
          >
            Refine answers
          </Button>
          <p className="mt-10 text-sm text-[#7A6258]">
            None of these quite fits?{" "}
            <Link
              href={ideaHref({ source: "recommend" })}
              className="font-semibold text-[#C75B39] hover:text-[#9e3f21]"
            >
              Tell us what you actually came for →
            </Link>
          </p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="relative min-h-[70dvh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_#FCE3DC_0%,_transparent_50%),linear-gradient(165deg,#FFF8F4_0%,#F5E9E2_60%,#FDEBE6_100%)]" />

      <PageContainer
        size="md"
        className="relative flex min-h-[70dvh] flex-col justify-center py-12 md:py-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            <Sparkles className="size-3.5" /> Find the right gift · 3 questions
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-[#3A2A25] md:text-5xl">
            Kyndl
          </h1>
        </motion.div>

        <div className="mb-5 h-1 overflow-hidden rounded-full bg-[#F4DDD0]">
          <motion.div
            className="h-full bg-[#C75B39]"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            <div>
              <h2 className="font-display text-2xl text-[#3A2A25] md:text-3xl">
                {copy.title}
              </h2>
              <p className="mt-1.5 text-sm text-[#7A6258]">{copy.subtitle}</p>
            </div>

            {step === "occasion" && (
              <ChoiceGrid
                options={OCCASIONS}
                value={answers.occasion}
                onChange={(occasion) => setAnswers((a) => ({ ...a, occasion }))}
              />
            )}

            {step === "vibe" && (
              <>
                <ChoiceGrid
                  options={VIBES}
                  value={answers.vibe}
                  onChange={(vibe) =>
                    setAnswers((a) => ({
                      ...a,
                      vibe,
                      adult_ok: vibe === "intimate",
                    }))
                  }
                />
                {answers.vibe === "intimate" ? (
                  <p className="text-xs text-[#7A6258]">
                    Intimate includes Red Zone (18+) suggestions.
                  </p>
                ) : null}
              </>
            )}

            {step === "details" && (
              <div className="space-y-5">
                <FieldLabel label="Digital, physical, or both?">
                  <ChoiceGrid
                    options={CHANNELS}
                    value={answers.channel_pref}
                    onChange={(channel_pref) =>
                      setAnswers((a) => ({ ...a, channel_pref }))
                    }
                    compact
                  />
                </FieldLabel>
                <FieldLabel label="Budget">
                  <ChoiceGrid
                    options={BUDGETS}
                    value={answers.budget_tier}
                    onChange={(budget_tier) =>
                      setAnswers((a) => ({ ...a, budget_tier }))
                    }
                    compact
                  />
                </FieldLabel>
                <FieldLabel label="When do you need it?">
                  <ChoiceGrid
                    options={TIMELINES}
                    value={answers.timeline}
                    onChange={(timeline) =>
                      setAnswers((a) => ({ ...a, timeline }))
                    }
                    compact
                  />
                </FieldLabel>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error ? <p className="mt-4 text-sm text-[#C81D4E]">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            disabled={stepIndex === 0 || pending}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button
              disabled={!canContinue || pending}
              onClick={() =>
                setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))
              }
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button disabled={!canContinue || pending} onClick={submit}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {pending ? "Finding…" : "Show my picks"}
            </Button>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium tracking-wide text-[#7A6258] uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: { value: T; label: string }[];
  value?: T | "";
  onChange: (value: T) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-2.5",
        compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3",
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-2xl text-left text-sm font-medium transition ring-1",
            compact ? "px-3 py-2.5" : "px-4 py-3.5",
            value === opt.value
              ? "bg-[#3A2A25] text-[#FFF8F4] ring-[#3A2A25]"
              : "bg-[#FFF8F4]/70 text-[#3A2A25] ring-[#F4DDD0] hover:ring-[#E8B4A0]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

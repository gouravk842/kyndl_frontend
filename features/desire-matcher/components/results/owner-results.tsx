"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SignInLink } from "@/components/auth/sign-in-link";
import { creationService } from "@/services/creations/creation.service";
import { useAuthStore } from "@/store/auth.store";

import type { MatcherContent } from "../../config";
import { computeReveal } from "../../lib/reveal";
import { RevealView } from "../reveal-view";

/**
 * The owner's results view for a Desire Matcher. Loads the creation (with their
 * own private answers) and the partner's responses, then recomputes the reveal
 * client-side — the same mutual-match rule the backend used for the partner.
 */
export function OwnerResults() {
  const params = useSearchParams();
  const id = params.get("id");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const creationQuery = useQuery({
    queryKey: ["matcher-creation", id],
    queryFn: () => creationService.get<MatcherContent>(id as string),
    enabled: isHydrated && isAuthenticated && !!id,
  });
  const responsesQuery = useQuery({
    queryKey: ["matcher-responses", id],
    queryFn: () => creationService.responses(id as string),
    enabled: isHydrated && isAuthenticated && !!id,
  });

  if (isHydrated && !isAuthenticated) {
    return (
      <Centered>
        <h1 className="font-display text-2xl text-white">Sign in to see this</h1>
        <p className="max-w-sm text-white/55">
          Your matches live in your account — sign in to open them.
        </p>
        <SignInLink className="rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-6 py-2.5 text-sm font-semibold text-white">
          Sign in
        </SignInLink>
      </Centered>
    );
  }

  if (!id) {
    return (
      <Centered>
        <p className="text-white/55">No matcher selected.</p>
      </Centered>
    );
  }

  if (creationQuery.isLoading || responsesQuery.isLoading || !isHydrated) {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-white/50" />
      </Centered>
    );
  }

  const creation = creationQuery.data;
  if (!creation) {
    return (
      <Centered>
        <p className="text-white/55">Couldn&apos;t load this matcher.</p>
      </Centered>
    );
  }

  // The latest partner response (responses come newest-first from the API).
  const latest = responsesQuery.data?.[0];
  const partnerAnswers = latest?.payload?.answers;

  if (!partnerAnswers) {
    const shareUrl = `/v/${creation.public_token}`;
    return (
      <Centered>
        <h1 className="font-display text-2xl text-white">
          Waiting on {creation.content.recipientName || "them"}
        </h1>
        <p className="max-w-sm text-white/55">
          As soon as they answer, your matches show up here — and you{"'"}ll get
          an email. Share your link if you haven{"'"}t yet.
        </p>
        <Link
          href={shareUrl}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          <Share2 className="size-4" /> Open the share link
        </Link>
      </Centered>
    );
  }

  const reveal = computeReveal(creation.content, partnerAnswers);
  const name =
    latest?.responder_name || creation.content.recipientName || "them";

  return (
    <div className="flex min-h-[60vh] w-full justify-center">
      <RevealView
        reveal={reveal}
        intro={`What you and ${name} are both into — out of ${reveal.total}.`}
      />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      {children}
    </div>
  );
}

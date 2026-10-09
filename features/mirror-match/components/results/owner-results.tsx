"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SignInLink } from "@/components/auth/sign-in-link";
import { creationService } from "@/services/creations/creation.service";
import { useAuthStore } from "@/store/auth.store";

import type { MirrorContent } from "../../config";
import { computeReveal } from "../../lib/reveal";
import { LookingGlass } from "../atmosphere";
import { RevealView } from "../reveal-view";

/**
 * Owner's results for a Mirror Match. Loads the creation (with private answers)
 * and partner responses, then recomputes the reveal client-side.
 */
export function OwnerResults() {
  const params = useSearchParams();
  const id = params.get("id");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const creationQuery = useQuery({
    queryKey: ["mirror-match-creation", id],
    queryFn: () => creationService.get<MirrorContent>(id as string),
    enabled: isHydrated && isAuthenticated && !!id,
  });
  const responsesQuery = useQuery({
    queryKey: ["mirror-match-responses", id],
    queryFn: () => creationService.responses(id as string),
    enabled: isHydrated && isAuthenticated && !!id,
  });

  if (isHydrated && !isAuthenticated) {
    return (
      <Centered>
        <LookingGlass size="sm">
          <p className="font-cursive text-2xl text-[#8E1020]">sign in</p>
          <p className="mt-2 text-xs text-[#5a3223]/55">
            Your mirror lives in your account
          </p>
        </LookingGlass>
        <SignInLink className="mt-6 rounded-full bg-gradient-to-r from-[#D4A373] to-[#B11226] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(177,18,38,0.25)]">
          Sign in
        </SignInLink>
      </Centered>
    );
  }

  if (!id) {
    return (
      <Centered>
        <p className="font-hand text-[#5a3223]/55">No mirror selected.</p>
      </Centered>
    );
  }

  if (creationQuery.isLoading || responsesQuery.isLoading || !isHydrated) {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-[#D4A373]" />
      </Centered>
    );
  }

  const creation = creationQuery.data;
  if (!creation) {
    return (
      <Centered>
        <p className="font-hand text-[#5a3223]/55">
          Couldn&apos;t load this mirror.
        </p>
      </Centered>
    );
  }

  const latest = responsesQuery.data?.[0];
  const partnerAnswers = latest?.payload?.answers;

  if (!partnerAnswers) {
    const shareUrl = `/v/${creation.public_token}`;
    const name = creation.content.recipientName || "them";
    return (
      <Centered>
        <LookingGlass size="md">
          <motion.div
            animate={{ opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="space-y-3"
          >
            <p className="font-cursive text-3xl text-[#8E1020]">waiting…</p>
            <p className="font-display text-lg text-[#2a1a14]">
              The glass is fogged for {name}
            </p>
            <p className="mx-auto max-w-[12rem] text-xs leading-relaxed text-[#5a3223]/55">
              As soon as they answer, your reflections clear here — and
              you&apos;ll get a note.
            </p>
          </motion.div>
        </LookingGlass>
        <Link
          href={shareUrl}
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#5a3223]/20 bg-white/50 px-5 py-2.5 text-sm font-medium text-[#5a3223] backdrop-blur transition-colors hover:bg-white/80"
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
        intro={`What you and ${name} both feel — out of ${reveal.total}.`}
        occasion={creation.content.occasion}
        ownerName={creation.content.ownerName}
        recipientName={name}
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

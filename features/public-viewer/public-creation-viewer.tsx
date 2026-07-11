"use client";

import { useQuery } from "@tanstack/react-query";
import { Lock, SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Conversation } from "@/features/comments/components/conversation";
import { MemoryJarPublicView } from "@/features/memory-jar/components/viewer/memory-jar-public-view";
import type { JarConfig } from "@/features/memory-jar/config";
import { MemoryPublicView } from "@/features/memory-pages/components/viewer/memory-public-view";
import { OurPlacesPublicView } from "@/features/our-places/components/our-places-public-view";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { withCallbackUrl } from "@/lib/navigation";
import { creationService } from "@/services/creations/creation.service";
import type { ApiError } from "@/types/api";
import type { Creation } from "@/types/creation";

import {
  assetUrls,
  hasPublicViewer,
  renderPublicExperience,
} from "./registry";

export function PublicCreationViewer({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ["public-creation", token],
    queryFn: () => creationService.getPublic(token),
    // 403/404 are definitive answers, not transient failures.
    retry: false,
    staleTime: 60 * 1000,
  });

  if (query.isLoading) {
    return (
      <Centered>
        <p className="animate-pulse font-display text-xl text-muted-foreground">
          opening…
        </p>
      </Centered>
    );
  }

  if (query.isError) {
    const status = (query.error as unknown as ApiError)?.status;
    if (status === 403) {
      // Send them to sign in, then straight back to this exact link so an
      // invited viewer lands on the keepsake once authenticated with the
      // invited email — no re-navigation, no lost destination.
      const loginHref = withCallbackUrl(ROUTES.login, `/v/${token}`);
      return (
        <Centered>
          <Lock className="size-8 text-muted-foreground" />
          <h1 className="font-display text-2xl">This one&apos;s private</h1>
          <p className="max-w-sm text-muted-foreground">
            You need to be invited to view this. Sign in with the email it was
            shared to.
          </p>
          <Button render={<Link href={loginHref} />}>Sign in</Button>
        </Centered>
      );
    }
    return (
      <Centered>
        <SearchX className="size-8 text-muted-foreground" />
        <h1 className="font-display text-2xl">Nothing here</h1>
        <p className="max-w-sm text-muted-foreground">
          This link is wrong, or the creation isn&apos;t published.
        </p>
      </Centered>
    );
  }

  const creation = query.data;
  if (!creation) return null;

  if (!hasPublicViewer(creation.type)) {
    return (
      <Centered>
        <h1 className="font-display text-2xl">{creation.title}</h1>
        <p className="max-w-sm text-muted-foreground">
          This experience opens best inside the Kyndl app — a shared viewer for
          it is coming soon.
        </p>
      </Centered>
    );
  }

  const experience = renderPublicExperience(
    creation.type,
    creation.content,
    assetUrls(creation.assets),
    token,
    creation.authors ?? {},
  );

  // Memory-pages get a bespoke keepsake layout: the album takes the full
  // viewport and the feedback surfaces are gathered into an on-theme guestbook.
  if (creation.type === "memory-pages") {
    return (
      <MemoryPublicView
        token={token}
        title={creation.title}
        commentsEnabled={creation.comments_enabled}
        chatEnabled={creation.chat_enabled}
        reviewsEnabled={creation.reviews_enabled}
      >
        {experience}
      </MemoryPublicView>
    );
  }

  // Memory Jar gets a warm full-screen keepsake page: floating header (title +
  // music autoplay + Review/Comments), drifting doodles & geometric shapes, and
  // a corner chat bubble — the feedback surfaces slide in as themed sheets.
  if (creation.type === "memory-jar") {
    const music = (creation.content as JarConfig).music;
    const musicUrl = music
      ? assetUrls(creation.assets)[music.fileId] ?? null
      : null;
    return (
      <MemoryJarPublicView
        token={token}
        title={creation.title}
        commentsEnabled={creation.comments_enabled}
        chatEnabled={creation.chat_enabled}
        reviewsEnabled={creation.reviews_enabled}
        musicUrl={musicUrl}
      >
        {experience}
      </MemoryJarPublicView>
    );
  }

  // Our Places is a full-screen map with a guided tour, so its feedback surfaces
  // float on top (pills + chat bubble) rather than sitting below the fold.
  if (creation.type === "our-places") {
    return (
      <OurPlacesPublicView
        token={token}
        commentsEnabled={creation.comments_enabled}
        reviewsEnabled={creation.reviews_enabled}
        chatEnabled={creation.chat_enabled}
      >
        {experience}
      </OurPlacesPublicView>
    );
  }

  // Immersive canvas experiences (their root is `h-full`) need a definite-height
  // parent or they collapse to nothing. Give them a full-viewport stage, with the
  // feedback surfaces below the fold on scroll.
  if (FULLSCREEN_EXPERIENCES.has(creation.type)) {
    return (
      <div className="w-full">
        <div className="h-dvh w-full">{experience}</div>
        <FeedbackSurfaces creation={creation} token={token} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full">
      {experience}
      <FeedbackSurfaces creation={creation} token={token} />
    </div>
  );
}

/** Experiences that own the whole viewport rather than flowing as page content. */
const FULLSCREEN_EXPERIENCES = new Set([
  "constellation",
  "memory-city",
  "memory-lantern",
  "chocolate-bouquet",
]);

/**
 * Let the people this was shared with rate the experience, talk about it, and
 * (if the owner enabled it) chat privately with the creator.
 */
function FeedbackSurfaces({
  creation,
  token,
}: {
  creation: Creation;
  token: string;
}) {
  if (
    !creation.reviews_enabled &&
    !creation.comments_enabled &&
    !creation.chat_enabled
  ) {
    return null;
  }
  return (
    <div className="mx-auto w-full max-w-2xl space-y-14 px-6 py-14">
      {creation.reviews_enabled && (
        <ReviewsSection
          type="experience"
          refId={token}
          title="Rate this experience"
        />
      )}

      {creation.comments_enabled && (
        <Conversation surface="experience" refId={token} title="Comments" />
      )}

      {creation.chat_enabled && (
        <Conversation
          surface="experience-chat"
          refId={token}
          title="Chat with the creator"
        />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      {children}
    </div>
  );
}

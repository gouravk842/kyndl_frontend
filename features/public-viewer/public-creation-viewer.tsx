"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Rocket, SearchX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PublishToShareDialog } from "@/features/dashboard/components/publish-to-share-dialog";
import { workspaceTabHref } from "@/features/dashboard/lib/workspace-tabs";
import { MemoryJarPublicView } from "@/features/memory-jar/components/viewer/memory-jar-public-view";
import type { JarConfig } from "@/features/memory-jar/config";
import { MemoryPublicView } from "@/features/memory-pages/components/viewer/memory-public-view";
import { OurPlacesPublicView } from "@/features/our-places/components/our-places-public-view";
import { RecipientAftermath } from "@/features/recipient-aftermath/components/recipient-aftermath";
import { withCallbackUrl } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { creationService } from "@/services/creations/creation.service";
import type { ApiError } from "@/types/api";
import type { Creation } from "@/types/creation";

import { MakeYourOwnFab } from "./make-your-own-fab";
import { assetUrls, hasPublicViewer, renderPublicExperience } from "./registry";

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
      <PublicViewFrame>
        <Centered>
          <p className="animate-pulse font-display text-xl text-muted-foreground">
            opening…
          </p>
        </Centered>
      </PublicViewFrame>
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
        <PublicViewFrame>
          <Centered>
            <Lock className="size-8 text-muted-foreground" />
            <h1 className="font-display text-2xl">This one&apos;s private</h1>
            <p className="max-w-sm text-muted-foreground">
              You need to be invited to view this. Sign in with the email it was
              shared to.
            </p>
            <Button render={<Link href={loginHref} />}>Sign in</Button>
          </Centered>
        </PublicViewFrame>
      );
    }
    return (
      <PublicViewFrame>
        <Centered>
          <SearchX className="size-8 text-muted-foreground" />
          <h1 className="font-display text-2xl">Nothing here</h1>
          <p className="max-w-sm text-muted-foreground">
            This link is wrong, or the creation isn&apos;t published.
          </p>
        </Centered>
      </PublicViewFrame>
    );
  }

  const creation = query.data;
  if (!creation) return null;

  const draftBanner =
    creation.status === "draft" ? (
      <OwnerDraftBanner creation={creation} token={token} />
    ) : null;

  if (!hasPublicViewer(creation.type)) {
    return (
      <PublicViewFrame>
        {draftBanner}
        <Centered>
          <h1 className="font-display text-2xl">{creation.title}</h1>
          <p className="max-w-sm text-muted-foreground">
            This experience opens best inside the Kyndl app — a shared viewer
            for it is coming soon.
          </p>
        </Centered>
        <MakeYourOwnFab experienceType={creation.type} fromToken={token} />
      </PublicViewFrame>
    );
  }

  const experience = renderPublicExperience(
    creation.type,
    creation.content,
    assetUrls(creation.assets),
    token,
    creation.authors ?? {},
    creation.id,
  );

  // Memory-pages / memory-jar put ChatDock in the same corner — lift the FAB.
  const offsetForChat =
    creation.chat_enabled &&
    (creation.type === "memory-pages" || creation.type === "memory-jar");

  const fab = (
    <MakeYourOwnFab
      experienceType={creation.type}
      fromToken={token}
      offsetForChat={offsetForChat}
    />
  );

  // Memory-pages get a bespoke keepsake layout: the album takes the full
  // viewport and the feedback surfaces are gathered into an on-theme guestbook.
  if (creation.type === "memory-pages") {
    return (
      <PublicViewFrame fill>
        {draftBanner}
        <MemoryPublicView
          token={token}
          experienceType={creation.type}
          title={creation.title}
          commentsEnabled={creation.comments_enabled}
          chatEnabled={creation.chat_enabled}
          reviewsEnabled={creation.reviews_enabled}
        >
          {experience}
        </MemoryPublicView>
        {fab}
      </PublicViewFrame>
    );
  }

  // Memory Jar gets a warm full-screen keepsake page: floating header (title +
  // music autoplay + Review/Comments), drifting doodles & geometric shapes, and
  // a corner chat bubble — the feedback surfaces slide in as themed sheets.
  if (creation.type === "memory-jar") {
    const music = (creation.content as JarConfig).music;
    const musicUrl = music
      ? (assetUrls(creation.assets)[music.fileId] ?? null)
      : null;
    return (
      <PublicViewFrame fill>
        {draftBanner}
        <MemoryJarPublicView
          token={token}
          experienceType={creation.type}
          title={creation.title}
          commentsEnabled={creation.comments_enabled}
          chatEnabled={creation.chat_enabled}
          reviewsEnabled={creation.reviews_enabled}
          musicUrl={musicUrl}
        >
          {experience}
        </MemoryJarPublicView>
        {fab}
      </PublicViewFrame>
    );
  }

  // Our Places is a full-screen map with a guided tour, so its feedback surfaces
  // float on top (pills + chat bubble) rather than sitting below the fold.
  if (creation.type === "our-places") {
    return (
      <PublicViewFrame fill>
        {draftBanner}
        <OurPlacesPublicView
          token={token}
          experienceType={creation.type}
          commentsEnabled={creation.comments_enabled}
          reviewsEnabled={creation.reviews_enabled}
          chatEnabled={creation.chat_enabled}
        >
          {experience}
        </OurPlacesPublicView>
        {fab}
      </PublicViewFrame>
    );
  }

  // Immersive canvas experiences (their root is `h-full`) need a definite-height
  // parent or they collapse to nothing. Give them a full-viewport stage, with the
  // recipient aftermath (reaction + make one back) below the fold on scroll.
  if (FULLSCREEN_EXPERIENCES.has(creation.type)) {
    return (
      <PublicViewFrame>
        {draftBanner}
        <div className="w-full">
          <div className="h-[calc(100dvh-4rem)] w-full">{experience}</div>
          <RecipientAftermath
            token={token}
            experienceType={creation.type}
            reviewsEnabled={creation.reviews_enabled}
            commentsEnabled={creation.comments_enabled}
            chatEnabled={creation.chat_enabled}
            published={Boolean(creation.published_at)}
          />
        </div>
        {fab}
      </PublicViewFrame>
    );
  }

  return (
    <PublicViewFrame>
      {draftBanner}
      <div className="min-h-[calc(100dvh-4rem)] w-full">
        {experience}
        <RecipientAftermath
          token={token}
          experienceType={creation.type}
          reviewsEnabled={creation.reviews_enabled}
          commentsEnabled={creation.comments_enabled}
          chatEnabled={creation.chat_enabled}
          published={Boolean(creation.published_at)}
        />
      </div>
      {fab}
    </PublicViewFrame>
  );
}

/** Sticky strip when the owner opens their own unpublished share link. */
function OwnerDraftBanner({
  creation,
  token,
}: {
  creation: Creation;
  token: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <>
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#f2dace] bg-[#3a2a25] px-4 py-3 text-sm text-[#fff7f1]">
        <p className="min-w-0 flex-1 leading-snug">
          <span className="font-semibold">Only you can see this.</span> Publish
          to share — everyone else gets an empty page until you do.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-[#ff7a59] text-white hover:bg-[#e86a4c]"
            onClick={() => setOpen(true)}
          >
            <Rocket className="size-3.5" />
            Publish to share
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[#fff7f1] hover:bg-white/10 hover:text-white"
            render={<Link href={workspaceTabHref(creation.id, "publish")} />}
          >
            Open dashboard
          </Button>
        </div>
      </div>
      <PublishToShareDialog
        open={open}
        onOpenChange={setOpen}
        creation={creation}
        onPublished={() => {
          void queryClient.invalidateQueries({
            queryKey: ["public-creation", token],
          });
        }}
      />
    </>
  );
}

/**
 * Site header on every public keepsake. `fill` locks the page to the viewport
 * so full-screen experiences (album, jar, map) sit under the header instead of
 * painting over it.
 */
function PublicViewFrame({
  fill = false,
  children,
}: {
  fill?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex flex-col bg-[#FFF7F1]", fill ? "h-dvh" : "min-h-dvh")}
    >
      <div className="shrink-0">
        <MarketingHeader />
      </div>
      {fill ? (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0">{children}</div>
        </div>
      ) : (
        children
      )}
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

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-3 px-6 text-center">
      {children}
    </div>
  );
}

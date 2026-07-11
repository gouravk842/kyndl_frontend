"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { FadeIn } from "@/components/animations/fade-in";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useUiStore } from "@/store/ui.store";

import { hasEmbeddedBuilder } from "../lib/builder-registry";
import { CREATE_KEY, HOME_KEY, resolveSelectedKey } from "../lib/categories";
import { useLibrary } from "../lib/use-library";
import { CategoryDetail } from "./category-detail";
import { CreationNewHost } from "./creation-edit-host";
import { CreationWorkspace } from "./creation-workspace";
import { CreationsEmptyState } from "./creations-empty-state";
import { DashboardAnalytics } from "./dashboard-analytics";

/**
 * The dashboard's single workspace pane. Its content is driven by the URL:
 *   ?new=<type>       → a fresh experience builder, embedded in the dashboard shell
 *   ?id=<id>[&tab=…]  → the creation workspace (Design builder + Share/Publish/Manage tabs)
 *   (none)            → the library (home overview or a selected category)
 * Reading `?new=`/`?id=`/`?tab=` needs a Suspense boundary (Next requirement).
 */
export function DashboardWorkspace() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceContent />
    </Suspense>
  );
}

function WorkspaceContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const newType = params.get("new");

  // Keep the sidebar category lit for the creation being viewed/edited/created,
  // so the rail never loses its place while you're deep in a keepsake.
  const { creations } = useLibrary();
  const setDashboardCategory = useUiStore((s) => s.setDashboardCategory);
  const openType =
    newType ?? (id ? creations.find((c) => c.id === id)?.type : undefined);
  useEffect(() => {
    if (openType) setDashboardCategory(openType);
  }, [openType, setDashboardCategory]);

  // A fresh build (`?new=`) mounts the builder before any `id` exists; once the
  // first save stamps `?id=` into the URL it keeps winning here, so the builder
  // stays put (now in edit mode) instead of flipping to the detail hub.
  if (newType && hasEmbeddedBuilder(newType))
    return <CreationNewHost type={newType} />;
  if (id) return <CreationWorkspace id={id} />;

  return <LibraryView />;
}

function LibraryView() {
  const { profile } = useAuth();
  const { categories, creations, orders, wishlist, isLoading } = useLibrary();

  const firstName = profile?.full_name?.trim().split(" ")[0] || "there";

  // The rail lives in the app sidebar; we mirror its selection here. The default
  // (and any stale pick) resolves to the home overview.
  const dashboardCategory = useUiStore((s) => s.dashboardCategory);
  const selected = resolveSelectedKey(categories, dashboardCategory);
  const isHome = selected === HOME_KEY;
  const activeCategory =
    selected === CREATE_KEY || isHome
      ? null
      : (categories.find((c) => c.key === selected) ?? null);

  const hasNothing =
    !isLoading && categories.length === 0 && creations.length === 0;

  // ── Home / landing: welcome + analytics ──────────────────────────────────
  if (isHome) {
    return (
      <div className="space-y-8">
        <FadeIn>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s a look at everything you&apos;ve made — pick a category
              on the left to dive in.
            </p>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : hasNothing ? (
          <CreationsEmptyState />
        ) : (
          <DashboardAnalytics />
        )}
      </div>
    );
  }

  // ── A specific category (or "Start something new") ───────────────────────
  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-60 rounded-2xl" />
          ))}
        </div>
      ) : (
        <FadeIn delay={0.05}>
          <CategoryDetail
            category={activeCategory}
            creations={creations}
            orders={orders}
            wishlist={wishlist}
          />
        </FadeIn>
      )}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-60 rounded-2xl" />
      ))}
    </div>
  );
}

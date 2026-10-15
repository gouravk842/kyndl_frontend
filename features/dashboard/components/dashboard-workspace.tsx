"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { FadeIn } from "@/components/animations/fade-in";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { useSiteSettings } from "@/components/site-settings/site-settings-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
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
  const settings = useSiteSettings();
  const id = params.get("id");
  const newType = params.get("new");
  const allowCreations = settings.show_experiences;

  // Keep the sidebar category lit for the creation being viewed/edited/created,
  // so the rail never loses its place while you're deep in a keepsake.
  const { creations } = useLibrary();
  const setDashboardCategory = useUiStore((s) => s.setDashboardCategory);
  const openType =
    newType ?? (id ? creations.find((c) => c.id === id)?.type : undefined);
  useEffect(() => {
    if (openType && allowCreations) setDashboardCategory(openType);
  }, [openType, setDashboardCategory, allowCreations]);

  // A fresh build (`?new=`) mounts the builder before any `id` exists; once the
  // first save stamps `?id=` into the URL it keeps winning here, so the builder
  // stays put (now in edit mode) instead of flipping to the detail hub.
  if (allowCreations && newType && hasEmbeddedBuilder(newType))
    return <CreationNewHost type={newType} />;
  if (allowCreations && id) return <CreationWorkspace id={id} />;

  return <LibraryView />;
}

function LibraryView() {
  const { profile } = useAuth();
  const settings = useSiteSettings();
  const { categories, creations, orders, wishlist, isLoading } = useLibrary();

  const firstName = profile?.full_name?.trim().split(" ")[0] || "there";
  const shopHome = settings.site_mode === "v2" && !settings.show_experiences;

  // The rail lives in the app sidebar; we mirror its selection here. The default
  // (and any stale pick) resolves to the home overview.
  const dashboardCategory = useUiStore((s) => s.dashboardCategory);
  const selected = resolveSelectedKey(categories, dashboardCategory);
  const isHome = selected === HOME_KEY || shopHome;
  const activeCategory =
    selected === CREATE_KEY || isHome
      ? null
      : (categories.find((c) => c.key === selected) ?? null);

  const hasNothing =
    !isLoading && categories.length === 0 && creations.length === 0;

  // Home: shop shortcuts in ecommerce v2, or library analytics in v1.
  if (isHome) {
    if (shopHome) {
      return (
        <div className="space-y-8">
          <FadeIn>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Your Kyndl shop account — browse gifts, track orders, and manage
                your wishlist.
              </p>
            </div>
          </FadeIn>
          {settings.show_gifts ? (
            <FadeIn delay={0.05}>
              <div className="flex flex-wrap gap-3">
                <KyndlButton href={ROUTES.gifts} size="lg">
                  Shop gifts
                </KyndlButton>
                <KyndlButton
                  href={ROUTES.giftOrders}
                  size="lg"
                  variant="secondary"
                >
                  My orders
                </KyndlButton>
                <KyndlButton
                  href={ROUTES.giftWishlist}
                  size="lg"
                  variant="secondary"
                >
                  Wishlist
                </KyndlButton>
              </div>
            </FadeIn>
          ) : null}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <FadeIn>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s a look at everything you&apos;ve made — pick a
              category on the left to dive in.
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

  // A specific category (or "Start something new")
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

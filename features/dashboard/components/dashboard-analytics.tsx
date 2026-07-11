"use client";

import { useMemo } from "react";

import { FadeIn } from "@/components/animations/fade-in";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeCreations } from "@/hooks/use-creations";

import { useLibrary } from "../lib/use-library";
import { DashboardStats } from "./dashboard-stats";

/** The analytics body — headline counts plus a per-category breakdown. Rendered
 *  under the welcome message on the dashboard landing. */
export function DashboardAnalytics() {
  const { categories, creations, isLoading } = useLibrary();
  const summary = useMemo(() => summarizeCreations(creations), [creations]);
  const max = Math.max(1, ...categories.map((c) => c.count));

  return (
    <div className="space-y-8">
      <FadeIn delay={0.05}>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <DashboardStats
            total={summary.total}
            published={summary.published}
            drafts={summary.drafts}
          />
        )}
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-medium">By category</h2>
          {isLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : categories.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-foreground/15 bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
              Nothing to chart yet — make your first keepsake.
            </p>
          ) : (
            <ul className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              {categories.map((cat) => (
                <li key={cat.key} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
                    <ExperienceIcon name={cat.iconName} className="size-4" />
                  </span>
                  <span className="w-40 shrink-0 truncate text-sm font-medium">
                    {cat.label}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${(cat.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                    {cat.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </FadeIn>
    </div>
  );
}

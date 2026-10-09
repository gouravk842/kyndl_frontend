"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { useCreations } from "@/hooks/use-creations";
import { cn } from "@/lib/utils";
import { normalizeApiError } from "@/services/api/errors";
import { memoryBankService } from "@/services/memory-bank/memory-bank.service";

import {
  resolveWorkspaceTab,
  WORKSPACE_TABS,
  workspaceTabHref,
} from "../lib/workspace-tabs";
import { DashboardContextBar } from "./dashboard-context-bar";

/**
 * Left-hand content of the persistent dashboard header. When a creation is open
 * (`?id=`) it becomes the workspace's tab bar — Back, the keepsake title, and the
 * Design / Share / Publish / Manage tabs that drive `?tab=`. Living in the 4rem
 * header means the Design tab keeps the builder full-height for free. For every
 * other view (library, `?new=`) it falls back to the plain breadcrumb.
 */
export function CreationWorkspaceHeader() {
  const params = useSearchParams();
  const id = params.get("id");

  if (!id) return <DashboardContextBar />;

  return <WorkspaceTabs id={id} />;
}

function WorkspaceTabs({ id }: { id: string }) {
  const params = useSearchParams();
  const activeTab = resolveWorkspaceTab(
    params.get("tab"),
    params.get("edit") === "1",
  );

  const { data: creations } = useCreations();
  const creation = creations?.find((c) => c.id === id);
  const title = creation?.title || "Untitled";
  const published = creation?.status === "published";
  const conversion = creation?.conversion;
  const queryClient = useQueryClient();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link
        href="/dashboard"
        aria-label="Back to library"
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
      </Link>

      <div className="hidden min-w-0 shrink items-center gap-2 sm:flex">
        <span className="max-w-[12rem] truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            published ? "bg-[#2fb672]" : "bg-[#d4a373]",
          )}
          title={published ? "Published" : "Draft"}
        />
      </div>
      {conversion ? (
        <span className="inline-block min-w-0 max-w-[38%] truncate text-xs text-muted-foreground sm:max-w-[14rem]">
          {conversion.source_circle_id ? (
            <Link
              href={ROUTES.memoryCircle(conversion.source_circle_id)}
              className="underline decoration-current/30 underline-offset-2"
            >
              Converted from {conversion.source_bank_name}
            </Link>
          ) : (
            <>Converted from {conversion.source_bank_name}</>
          )}
          {conversion.mode === "live" ? (
            <>
              <span className="mx-1">·</span>
              <button
                type="button"
                className="underline decoration-current/30 underline-offset-2"
                title="Edits in the builder won’t stick. Detach to edit."
                onClick={() => {
                  memoryBankService
                    .detachConversion(conversion.id)
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: queryKeys.creations.all,
                      });
                      toast.success("Detached from the bank.");
                    })
                    .catch((error: unknown) =>
                      toast.error(normalizeApiError(error).message),
                    );
                }}
              >
                Detach
              </button>
            </>
          ) : null}
        </span>
      ) : null}

      <nav
        aria-label="Workspace sections"
        className="scrollbar-hide flex items-center gap-1 overflow-x-auto rounded-full bg-muted/60 p-1"
      >
        {WORKSPACE_TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Link
              key={tab.key}
              href={workspaceTabHref(id, tab.key)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1 text-sm whitespace-nowrap transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { creationMeta } from "@/lib/creations";

/**
 * Left-hand content of the persistent dashboard header for the views *without* an
 * open creation: a "Library / New <Experience>" breadcrumb during a fresh build
 * (`?new=`, before the first save stamps `?id=`), and empty on the plain library.
 * Once a creation is open, `CreationWorkspaceHeader` renders the workspace tab bar
 * instead of this.
 */
export function DashboardContextBar() {
  const params = useSearchParams();
  const newType = params.get("new");

  if (!newType) return <div />;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Link href="/dashboard" className="transition-colors hover:text-foreground">
        Library
      </Link>
      <ChevronRight className="size-3.5 shrink-0 opacity-60" />
      <span className="font-medium text-foreground">
        New {creationMeta(newType).name}
      </span>
    </nav>
  );
}

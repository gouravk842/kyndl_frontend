"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { hasEmbeddedBuilder, renderBuilder } from "../lib/builder-registry";

/**
 * Hosts a *fresh* experience builder inside the dashboard shell (via `?new=<type>`),
 * so authoring a new keepsake never leaves the logged-in app. Unlike the edit host
 * there's no creation to resolve — the type comes straight from the URL, and the
 * builder's sync hook creates the record (and stamps `?id=`) on first save.
 */
export function CreationNewHost({ type }: { type: string }) {
  if (!hasEmbeddedBuilder(type)) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="font-heading text-xl">Nothing to build here</h1>
        <p className="text-muted-foreground">
          This experience doesn&apos;t have an in-app editor yet.
        </p>
        <Button render={<Link href="/dashboard" />} variant="secondary">
          Back to library
        </Button>
      </div>
    );
  }

  return <div className="-m-6">{renderBuilder(type)}</div>;
}

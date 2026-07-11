"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { newCreationHref } from "@/lib/creations";

/** Shown when a signed-in user has no creations yet — a warm nudge, not a void. */
export function CreationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-foreground/15 bg-card/50 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#F2596F] text-white shadow-sm">
        <Sparkles className="size-6" />
      </span>
      <h3 className="mt-5 font-heading text-lg font-medium text-foreground">
        Your first memory is waiting
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Every Kyndl keepsake starts with a single moment. Begin a scrapbook and
        fill it with photos, notes, and the things worth keeping.
      </p>
      <Button
        render={<Link href={newCreationHref("scrapbook")} />}
        nativeButton={false}
        size="lg"
        className="mt-6"
      >
        <Sparkles className="size-4" />
        Start a scrapbook
      </Button>
    </div>
  );
}

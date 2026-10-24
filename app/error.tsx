"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { CrashCommentForm } from "@/features/issues/components/crash-comment-form";
import { reportError } from "@/lib/report-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "route" });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again — or leave a short note
        if it keeps happening.
      </p>
      <Button onClick={reset}>Try again</Button>
      <CrashCommentForm digest={error.digest} />
    </div>
  );
}

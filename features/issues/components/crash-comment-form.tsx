"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getLastRequestId } from "@/lib/report-error";
import { cn } from "@/lib/utils";
import { submitIssueReport } from "@/services/issues/issue.service";

const MAX_MESSAGE = 2000;

export function CrashCommentForm({ digest }: { digest?: string }) {
  const requestId = getLastRequestId();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const correlation = requestId || digest || "";
  const canSubmit = message.trim().length >= 8 && !pending;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      await submitIssueReport({
        message: message.trim(),
        page_path:
          typeof window !== "undefined" ? window.location.pathname : "",
        request_id: requestId,
        digest,
        source: "crash",
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send that just now.",
      );
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className="max-w-md text-sm text-muted-foreground">
        Thanks — we have your note.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-2">
      <label htmlFor="crash-comment" className="sr-only">
        What were you doing?
      </label>
      <textarea
        id="crash-comment"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={MAX_MESSAGE}
        rows={3}
        disabled={pending}
        placeholder="What were you doing? (optional)"
        className={cn(
          "min-h-[72px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:opacity-50",
        )}
      />
      {correlation ? (
        <p className="text-xs text-muted-foreground">
          We recorded this
          {requestId ? ` · ${requestId}` : ""}
          {!requestId && digest ? ` · ${digest}` : ""}.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">We recorded this.</p>
      )}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="outline" disabled={!canSubmit}>
        {pending ? "Sending…" : "Send note"}
      </Button>
    </form>
  );
}

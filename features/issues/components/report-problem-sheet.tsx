"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getLastRequestId } from "@/lib/report-error";
import { cn } from "@/lib/utils";
import { submitIssueReport } from "@/services/issues/issue.service";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";

const MAX_MESSAGE = 2000;

export function ReportProblemSheet() {
  const open = useUiStore((s) => s.reportProblemOpen);
  const setOpen = useUiStore((s) => s.setReportProblemOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Report a problem</SheetTitle>
          <SheetDescription>
            Tell us what went wrong. We record the page you were on — not the
            keepsake itself.
          </SheetDescription>
        </SheetHeader>
        {open ? <ReportProblemForm onDone={() => setOpen(false)} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function ReportProblemForm({ onDone }: { onDone: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = message.trim().length >= 8 && !pending;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      await submitIssueReport({
        message: message.trim(),
        email: (user?.email ?? email).trim(),
        page_path:
          typeof window !== "undefined" ? window.location.pathname : "",
        request_id: getLastRequestId(),
        source: "help",
        company_website: companyWebsite,
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
      <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-8 text-center">
        <p className="font-heading text-base font-medium">We have it.</p>
        <p className="text-sm text-muted-foreground">
          Thanks for telling us. We’ll look into it.
        </p>
        <Button className="mt-4 self-center" onClick={onDone}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative flex flex-1 flex-col">
      <div
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden
      >
        <label>
          Company website
          <input
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            name="company_website"
          />
        </label>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="issue-message">What happened?</Label>
          <textarea
            id="issue-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_MESSAGE}
            rows={5}
            required
            disabled={pending}
            placeholder="I tapped publish and the page went blank…"
            className={cn(
              "min-h-[110px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:opacity-50",
            )}
          />
          <p className="text-right text-xs text-muted-foreground">
            {message.length}/{MAX_MESSAGE}
          </p>
        </div>

        {!user ? (
          <div className="space-y-1.5">
            <Label htmlFor="issue-email">Email (optional)</Label>
            <Input
              id="issue-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              placeholder="so we can write back"
              autoComplete="email"
            />
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <SheetFooter>
        <Button type="submit" disabled={!canSubmit}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </SheetFooter>
    </form>
  );
}

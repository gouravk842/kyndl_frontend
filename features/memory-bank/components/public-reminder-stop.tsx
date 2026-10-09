"use client";

import Link from "next/link";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import { KeepFrame } from "@/features/memory-bank/components/public-keep";
import { decodeKeepToken } from "@/features/memory-bank/lib/keep-token";

export type StopPreview = {
  first_name: string;
  stopped: boolean;
};

export function StopFaded() {
  return (
    <KeepFrame>
      <Eyebrow />
      <h1 className="mt-4 font-display text-4xl leading-tight">
        This link has faded.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-kyndl-taupe">
        Open your memory bank if you still want to change this.
      </p>
      <BankLink />
    </KeepFrame>
  );
}

export function StopUnavailable() {
  return (
    <KeepFrame>
      <Eyebrow />
      <h1 className="mt-4 font-display text-4xl leading-tight">
        Give it a moment.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-kyndl-taupe">
        Try the link again.
      </p>
    </KeepFrame>
  );
}

export function PublicReminderStop({
  token,
  preview,
}: {
  token: string;
  preview: StopPreview;
}) {
  const [stopped, setStopped] = useState(preview.stopped);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [faded, setFaded] = useState(false);

  if (faded) return <StopFaded />;

  const name = preview.first_name.trim();
  const headline = stopped
    ? "These reminders are off."
    : name
      ? `${name}, stop the daily reminder?`
      : "Stop the daily reminder?";

  async function onStop(event: React.FormEvent) {
    event.preventDefault();
    if (pending || stopped) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/memory-bank/keep/stop/${encodeURIComponent(decodeKeepToken(token))}`,
        { method: "POST", headers: { Accept: "application/json" } },
      );
      if (response.status === 404) {
        setFaded(true);
        return;
      }
      if (response.status === 429) {
        setError("That's enough for this hour. Try again a little later.");
        return;
      }
      if (!response.ok) {
        setError("Try once more.");
        return;
      }
      setStopped(true);
    } catch {
      setError("Try once more.");
    } finally {
      setPending(false);
    }
  }

  return (
    <KeepFrame>
      <Eyebrow />
      <h1 className="mt-4 font-display text-4xl leading-tight">{headline}</h1>
      <p className="mt-4 text-base leading-relaxed text-kyndl-taupe">
        {stopped
          ? "Your memories stay where they are."
          : "Your memories stay where they are. This only stops the morning email."}
      </p>
      {stopped ? (
        <BankLink />
      ) : (
        <form onSubmit={onStop} className="mt-8">
          {error ? (
            <p role="alert" className="mb-4 text-sm text-kyndl-rose">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 w-full rounded-full bg-kyndl-cocoa px-5 text-base text-kyndl-cream transition-opacity disabled:opacity-40"
          >
            {pending ? "Stopping…" : "Stop emails"}
          </button>
        </form>
      )}
    </KeepFrame>
  );
}

function Eyebrow() {
  return (
    <p className="text-xs font-medium tracking-[0.22em] text-kyndl-gold uppercase">
      Memory bank
    </p>
  );
}

function BankLink() {
  return (
    <Link
      href={ROUTES.memories}
      className="mt-8 inline-flex text-sm text-kyndl-cocoa underline-offset-4 hover:underline"
    >
      Open your memory bank
    </Link>
  );
}

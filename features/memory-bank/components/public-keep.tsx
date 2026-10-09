"use client";

import Link from "next/link";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import { decodeKeepToken } from "@/features/memory-bank/lib/keep-token";

export type KeepPreview = {
  first_name: string;
  current_streak: number;
  kept_today: boolean;
};

type KeepResult = {
  id: string;
  current_streak: number;
  kept_today: boolean;
};

export function KeepFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-kyndl-cream text-kyndl-cocoa">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -10%, rgba(212,163,115,0.45) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 100% 100%, rgba(255,122,89,0.16) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
        {children}
      </div>
    </main>
  );
}

export function KeepFaded() {
  return (
    <KeepFrame>
      <p className="text-xs font-medium tracking-[0.22em] text-kyndl-gold uppercase">
        Memory bank
      </p>
      <h1 className="mt-4 font-display text-4xl leading-tight">
        This link has faded.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-kyndl-taupe">
        Today&apos;s reminder has closed. Open your memory bank when you want to
        keep something.
      </p>
      <BankLink />
    </KeepFrame>
  );
}

export function KeepUnavailable() {
  return (
    <KeepFrame>
      <p className="text-xs font-medium tracking-[0.22em] text-kyndl-gold uppercase">
        Memory bank
      </p>
      <h1 className="mt-4 font-display text-4xl leading-tight">
        Give it a moment.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-kyndl-taupe">
        Try the link again.
      </p>
    </KeepFrame>
  );
}

export function PublicKeepForm({
  token,
  preview,
}: {
  token: string;
  preview: KeepPreview;
}) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [more, setMore] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [faded, setFaded] = useState(false);
  const [kept, setKept] = useState<KeepResult | null>(null);

  if (faded) return <KeepFaded />;
  if (kept) {
    return (
      <KeepFrame>
        <p className="text-xs font-medium tracking-[0.22em] text-kyndl-gold uppercase">
          Memory bank
        </p>
        <h1 className="mt-4 font-display text-5xl">Kept.</h1>
        <p className="mt-4 text-lg text-kyndl-taupe">
          {daysLine(kept.current_streak)}
        </p>
        <BankLink />
      </KeepFrame>
    );
  }

  const name = preview.first_name.trim();
  const headline = preview.kept_today
    ? name
      ? `${name}, today's streak is safe`
      : "Today's streak is safe"
    : name
      ? `${name}, keep today's memory`
      : "Keep today's memory";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/memory-bank/keep/${encodeURIComponent(decodeKeepToken(token))}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: nextTitle, note: note.trim() }),
        },
      );
      const body = (await response.json().catch(() => null)) as
        | KeepResult
        | { detail?: string }
        | null;
      if (response.status === 404) {
        setFaded(true);
        return;
      }
      if (response.status === 429) {
        setError("That's enough for this hour. Try again a little later.");
        return;
      }
      if (!response.ok || !isKeepResult(body)) {
        setError(
          body && "detail" in body && typeof body.detail === "string"
            ? body.detail
            : "Try once more.",
        );
        return;
      }
      setKept(body);
    } catch {
      setError("Try once more.");
    } finally {
      setPending(false);
    }
  }

  return (
    <KeepFrame>
      <p className="text-xs font-medium tracking-[0.22em] text-kyndl-gold uppercase">
        Memory bank
      </p>
      <h1 className="mt-4 font-display text-4xl leading-tight">{headline}</h1>
      <p className="mt-3 text-base text-kyndl-taupe">
        {preview.kept_today
          ? "Add another, if you want."
          : preview.current_streak > 0
            ? daysLine(preview.current_streak)
            : "A title is enough."}
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="keep-title" className="sr-only">
            Title
          </label>
          <input
            id="keep-title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
            autoFocus
            autoComplete="off"
            placeholder="What do you want to keep?"
            className="w-full rounded-2xl border border-[#f2dace] bg-white px-4 py-4 text-base text-kyndl-cocoa outline-none placeholder:text-kyndl-taupe/80 focus:border-kyndl-gold"
          />
        </div>
        {more ? (
          <div>
            <label htmlFor="keep-note" className="sr-only">
              Say more
            </label>
            <textarea
              id="keep-note"
              name="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={8000}
              rows={4}
              placeholder="Say more"
              className="w-full resize-none rounded-2xl border border-[#f2dace] bg-white px-4 py-3 text-base text-kyndl-cocoa outline-none placeholder:text-kyndl-taupe/80 focus:border-kyndl-gold"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMore(true)}
            className="text-sm text-kyndl-taupe underline-offset-4 hover:text-kyndl-cocoa hover:underline"
          >
            Say more
          </button>
        )}
        {error ? (
          <p role="alert" className="text-sm text-kyndl-rose">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="min-h-12 w-full rounded-full bg-kyndl-cocoa px-5 text-base text-kyndl-cream transition-opacity disabled:opacity-40"
        >
          {pending ? "Keeping…" : "Keep it"}
        </button>
      </form>
    </KeepFrame>
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

function daysLine(count: number): string {
  if (count === 1) return "1 day.";
  return `${count} days.`;
}

function isKeepResult(body: unknown): body is KeepResult {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return (
    typeof value.id === "string" &&
    typeof value.current_streak === "number" &&
    typeof value.kept_today === "boolean"
  );
}

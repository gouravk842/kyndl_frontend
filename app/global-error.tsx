"use client";

import { useEffect, useState } from "react";

import { getLastRequestId, reportError } from "@/lib/report-error";

/**
 * Catches errors thrown in the root layout itself — the one place the regular
 * `error.tsx` cannot reach. It must render its own `<html>`/`<body>` and cannot
 * rely on global CSS or providers, so styles are inlined.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "global" });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1rem",
          textAlign: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#090909",
          color: "#f5e9e2",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          Something went wrong
        </h2>
        <p style={{ maxWidth: "28rem", color: "#b3b3b3", margin: 0 }}>
          An unexpected error occurred. Please try again — or leave a short note
          if it keeps happening.
        </p>
        <button
          onClick={reset}
          style={{
            cursor: "pointer",
            borderRadius: "0.5rem",
            border: "none",
            background: "#b11226",
            color: "#f5e9e2",
            padding: "0.625rem 1.25rem",
            fontSize: "0.9375rem",
            fontWeight: 500,
          }}
        >
          Try again
        </button>
        <GlobalCrashNote digest={error.digest} />
      </body>
    </html>
  );
}

function GlobalCrashNote({ digest }: { digest?: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 8 || pending) return;
    setPending(true);
    try {
      await fetch("/api/issues/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          message: trimmed,
          page_path:
            typeof window !== "undefined" ? window.location.pathname : "",
          request_id: getLastRequestId(),
          digest: digest ?? "",
          source: "crash",
        }),
      });
      setSent(true);
    } catch {
      setSent(false);
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p style={{ maxWidth: "28rem", color: "#b3b3b3", margin: 0 }}>
        Thanks — we have your note.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "100%",
        maxWidth: "28rem",
      }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={2000}
        rows={3}
        disabled={pending}
        placeholder="What were you doing? (optional)"
        style={{
          width: "100%",
          resize: "vertical",
          borderRadius: "0.5rem",
          border: "1px solid #3a2a25",
          background: "#140f0e",
          color: "#f5e9e2",
          padding: "0.5rem 0.75rem",
          fontFamily: "inherit",
          fontSize: "0.875rem",
        }}
      />
      <p style={{ margin: 0, fontSize: "0.75rem", color: "#92786c" }}>
        We recorded this{digest ? ` · ${digest}` : ""}.
      </p>
      <button
        type="submit"
        disabled={pending || message.trim().length < 8}
        style={{
          cursor: pending ? "default" : "pointer",
          alignSelf: "center",
          borderRadius: "0.5rem",
          border: "1px solid #3a2a25",
          background: "transparent",
          color: "#f5e9e2",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          opacity: pending || message.trim().length < 8 ? 0.5 : 1,
        }}
      >
        {pending ? "Sending…" : "Send note"}
      </button>
    </form>
  );
}

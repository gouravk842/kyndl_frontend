"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/report-error";

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
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
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
      </body>
    </html>
  );
}

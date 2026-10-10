import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// An orphan lockfile at the monorepo root makes Turbopack watch the whole repo.
const appRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Origin of the backend API, used to scope `connect-src` (CSP) and the image
 * optimizer's `remotePatterns`. Falls back to localhost in dev so a missing env
 * var never breaks the build.
 */
function apiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
      .origin;
  } catch {
    return "http://localhost:8000";
  }
}

const API_ORIGIN = apiOrigin();

/**
 * Origin of the object store (S3/MinIO). Photo uploads POST presigned forms
 * straight to the bucket — a different origin from the API — so it must be
 * whitelisted in `connect-src`/`img-src`. Defaults to the local MinIO endpoint
 * in dev; set `NEXT_PUBLIC_STORAGE_URL` to the bucket/CDN origin in production.
 */
function storageOrigin(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_STORAGE_URL ??
    (isDev ? "http://localhost:9000" : "");
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

const STORAGE_ORIGIN = storageOrigin();

/**
 * WebSocket origin for live chat / notifications. CSP treats `wss:` separately
 * from `https:`, so the API host alone is not enough in production.
 */
function wsOrigin(): string | null {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      return null;
    }
  }
  try {
    const u = new URL(API_ORIGIN);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return u.origin;
  } catch {
    return null;
  }
}

const WS_ORIGIN = wsOrigin();

/**
 * External origins the browser is allowed to fetch from (CSP `connect-src`).
 * Our Places searches locations via OpenStreetMap's key-less Nominatim API.
 * GA4 beacons hit Google Analytics / gtag endpoints when measurement id is set.
 * Razorpay checkout talks to their API + telemetry hosts from the browser.
 */
const CONNECT_ALLOWLIST = [
  "https://nominatim.openstreetmap.org",
  "https://www.google-analytics.com",
  "https://analytics.google.com",
  "https://www.googletagmanager.com",
  "https://api.razorpay.com",
  "https://lumberjack.razorpay.com",
];

/**
 * Content-Security-Policy. Next.js injects a small amount of inline JS/CSS
 * (theme bootstrap, streaming runtime) so `'unsafe-inline'` is required without
 * a nonce pipeline; dev additionally needs `'unsafe-eval'` + websockets for HMR.
 * Everything else is locked to same-origin.
 */
function contentSecurityPolicy(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://checkout.razorpay.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https:",
      ...(STORAGE_ORIGIN ? [STORAGE_ORIGIN] : []),
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      API_ORIGIN,
      ...(WS_ORIGIN ? [WS_ORIGIN] : []),
      ...(STORAGE_ORIGIN ? [STORAGE_ORIGIN] : []),
      ...CONNECT_ALLOWLIST,
      ...(isDev ? ["ws:", "wss:"] : []),
    ],
    // Razorpay Checkout opens its payment UI in a frame.
    "frame-src": [
      "'self'",
      "https://api.razorpay.com",
      "https://checkout.razorpay.com",
    ],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
  };

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length ? `${key} ${values.join(" ")}` : key,
    )
    .join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // HSTS is only meaningful over HTTPS; skip it in dev to avoid pinning localhost.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: appRoot,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Scope the optimizer to known hosts only — `hostname: "**"` would let it
    // proxy arbitrary URLs (an SSRF/abuse vector). Add CDN hosts here as needed.
    remotePatterns: [
      { protocol: "https" as const, hostname: new URL(API_ORIGIN).hostname },
      ...(STORAGE_ORIGIN
        ? [
            {
              protocol: (STORAGE_ORIGIN.startsWith("http:")
                ? "http"
                : "https") as "http" | "https",
              hostname: new URL(STORAGE_ORIGIN).hostname,
            },
          ]
        : []),
      ...(isDev ? [{ protocol: "http" as const, hostname: "localhost" }] : []),
    ],
  },
  experimental: {
    // Persistent dev cache has no size cap and had grown to ~8GB, which
    // makes `next dev` map it into RAM and freeze the machine on startup.
    turbopackFileSystemCacheForDev: false,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@tanstack/react-query",
    ],
  },
};

export default nextConfig;

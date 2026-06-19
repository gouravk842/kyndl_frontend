import { readFile } from "node:fs/promises";
import path from "node:path";

import Link from "next/link";

import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Ludo Party",
  description:
    "Multiplayer Ludo for couples and friends with an optional activity mode.",
  path: "/games/ludo",
});

async function loadStandaloneLudoHtml() {
  const htmlPath = path.join(process.cwd(), "ludo.html");
  try {
    return await readFile(htmlPath, "utf8");
  } catch {
    return null;
  }
}

export default async function LudoPage() {
  const ludoHtml = await loadStandaloneLudoHtml();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[#F5E9E2] sm:text-4xl">
            Ludo Party
          </h1>
          <p className="mt-1 text-sm text-[#B3B3B3]">
            Standalone game loaded inside Kyndl.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/games"
            className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm text-[#F5E9E2] transition-colors hover:border-[#C21830]/40 hover:bg-white/5"
          >
            ← All Games
          </Link>
          <Link
            href="/games/ludo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-full bg-[#B11226] px-4 text-sm font-medium text-[#F5E9E2] transition-colors hover:bg-[#C21830]"
          >
            Open in New Tab
          </Link>
        </div>
      </div>

      {ludoHtml ? (
        <iframe
          title="Ludo Party game"
          srcDoc={ludoHtml}
          className="h-[82vh] w-full rounded-2xl border border-white/10 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <div className="rounded-2xl border border-red-300/40 bg-red-500/10 p-5 text-sm text-red-200">
          Could not load <code>ludo.html</code>. Make sure the file exists in
          the project root.
        </div>
      )}
    </section>
  );
}

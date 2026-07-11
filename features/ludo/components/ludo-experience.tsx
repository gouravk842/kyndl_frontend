"use client";

import dynamic from "next/dynamic";

import type { LudoConfig } from "../config";

// The game is fully interactive (Web Audio, Web Animations, framer-motion) and
// has no SSR value, so it loads client-only — same pattern as the other
// marketing experiences.
const LudoGame = dynamic(() => import("./ludo-game").then((m) => m.LudoGame), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center">
      <p className="animate-pulse font-display text-2xl text-[#C75B39]">
        setting up the board…
      </p>
    </div>
  ),
});

/**
 * The Ludo experience. On the marketing `/games/ludo` page it opens on the setup
 * screen; a saved/shared creation passes `config` so it starts straight into the
 * authored game (see the public viewer + builder preview).
 */
export function LudoExperience({ config }: { config?: LudoConfig }) {
  return <LudoGame config={config} />;
}

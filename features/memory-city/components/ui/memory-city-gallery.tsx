"use client";

import { motion } from "framer-motion";

import { nodeAccent, nodeTitle } from "../../lib/node-visuals";
import type { MessageConfig } from "../../modules/message";
import { useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";

/**
 * Flat chronological gallery — used when WebGL is unavailable or too slow.
 */
export function MemoryCityGallery({ city }: { city: CityConfig }) {
  const recalled = useMemoryCityStore((s) => s.recalled);
  const activate = useMemoryCityStore((s) => s.activate);
  const start = useMemoryCityStore((s) => s.start);
  const started = useMemoryCityStore((s) => s.started);

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#0b0a1a] px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="space-y-2 text-center">
          <p className="text-xs tracking-[0.2em] text-[#7fd9ff]/80 uppercase">
            Memory City
          </p>
          <h1 className="font-display text-3xl text-white">{city.title}</h1>
          {(city.from || city.to) && (
            <p className="text-sm text-white/55">
              {city.from && city.to
                ? `From ${city.from} to ${city.to}`
                : city.from || city.to}
            </p>
          )}
          <p className="text-xs text-white/40">
            A quieter view of your city — open each memory below.
          </p>
          {!started && (
            <button
              type="button"
              onClick={() => start()}
              className="mt-3 inline-flex h-10 items-center rounded-full bg-[#7fd9ff] px-5 text-sm font-semibold text-[#0b0a1a]"
            >
              Begin
            </button>
          )}
        </header>

        <ul className="space-y-3">
          {city.nodes.map((node, i) => {
            const title = nodeTitle(node);
            const accent = nodeAccent(node);
            const done = recalled.has(node.id);
            const body =
              node.reward.type === "message"
                ? (node.reward.config as MessageConfig).body
                : undefined;
            return (
              <motion.li
                key={node.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <button
                  type="button"
                  onClick={() => activate(node)}
                  className="w-full rounded-2xl border border-white/10 bg-[#15122a] p-4 text-left transition-colors hover:border-white/25"
                  style={{
                    boxShadow: done ? `0 0 0 1px ${accent}55` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/40">#{i + 1}</span>
                    <span
                      className="size-2 rounded-full"
                      style={{ background: accent }}
                    />
                  </div>
                  <h2 className="mt-1 font-display text-lg text-white">
                    {title}
                  </h2>
                  {body && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">
                      {body}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-[#7fd9ff]/80">
                    {done ? "Recalled" : "Open"}
                  </p>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

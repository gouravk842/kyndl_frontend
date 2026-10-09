import { ROUTES } from "@/constants/routes";
import type { IdeaSource } from "@/types/idea";

const SOURCES: readonly IdeaSource[] = [
  "homepage",
  "experiences",
  "gifts",
  "games",
  "recommend",
  "feedback",
];

export function isIdeaSource(value: string): value is IdeaSource {
  return (SOURCES as readonly string[]).includes(value);
}

/** Dedicated ideas page, optionally remembering where the visitor came from. */
export function ideaHref(opts?: { source?: IdeaSource; seed?: string }) {
  const params = new URLSearchParams();
  if (opts?.source) params.set("source", opts.source);
  const seed = opts?.seed?.trim();
  if (seed) params.set("seed", seed.slice(0, 200));
  const query = params.toString();
  return query ? `${ROUTES.ideas}?${query}` : ROUTES.ideas;
}

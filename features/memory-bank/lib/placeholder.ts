import { hashUnit } from "@/features/memory-bank/solar/layout";

export const PLACEHOLDER_SLUGS = [
  "fox",
  "hare",
  "swan",
  "dove",
  "cat",
  "moon",
  "lantern",
  "star",
] as const;

export type PlaceholderSlug = (typeof PLACEHOLDER_SLUGS)[number];

export function placeholderSlug(seed: string): PlaceholderSlug {
  const index = Math.floor(hashUnit(seed, 19) * PLACEHOLDER_SLUGS.length);
  return PLACEHOLDER_SLUGS[index] ?? PLACEHOLDER_SLUGS[0];
}

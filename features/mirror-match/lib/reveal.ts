import type { Answer, MirrorContent, Reveal } from "../config";

/**
 * Compute the mutual reveal client-side — mirrors the backend's `build_reveal`
 * in `experiences/types/mirror_match.py`. Used for the marketing demo (no
 * backend round-trip) and the owner's results view.
 *
 * Matches = both said "yes". Soft matches = neither said "no" but it wasn't a
 * double-yes. A "no" on either side hides the item entirely.
 */
export function computeReveal(
  content: MirrorContent,
  partnerAnswers: Record<string, Answer>,
): Reveal {
  const owner = content.ownerAnswers ?? {};
  const matches: Reveal["matches"] = [];
  const softMatches: Reveal["softMatches"] = [];
  for (const item of content.items) {
    const o = owner[item.id] ?? "no";
    const p = partnerAnswers[item.id] ?? "no";
    if (o === "no" || p === "no") continue;
    const slim = { id: item.id, label: item.label, mood: item.mood };
    if (o === "yes" && p === "yes") matches.push(slim);
    else softMatches.push(slim);
  }
  return { matches, softMatches, total: content.items.length };
}

import type { Answer, MatcherContent, Reveal } from "../config";

/**
 * Compute the mutual reveal client-side — mirrors the backend's `build_reveal`
 * in `experiences/types/desire_matcher.py`. Used for the marketing demo (no
 * backend round-trip) and the owner's results view (which recomputes from the
 * owner's own answers + the partner's stored answers).
 *
 * Matches = both said "yes". Maybes = neither said "no" but it wasn't a
 * double-yes. A "no" on either side hides the item entirely.
 */
export function computeReveal(
  content: MatcherContent,
  partnerAnswers: Record<string, Answer>,
): Reveal {
  const owner = content.ownerAnswers ?? {};
  const matches: Reveal["matches"] = [];
  const maybes: Reveal["maybes"] = [];
  for (const item of content.items) {
    const o = owner[item.id] ?? "no";
    const p = partnerAnswers[item.id] ?? "no";
    if (o === "no" || p === "no") continue;
    const slim = { id: item.id, label: item.label, heat: item.heat };
    if (o === "yes" && p === "yes") matches.push(slim);
    else maybes.push(slim);
  }
  return { matches, maybes, total: content.items.length };
}

export type KyndFact = {
  id: string;
  label: string;
  value: string;
  keywords: string[];
};

const SYNONYMS: Record<string, string[]> = {
  fav: ["favourite", "favorite", "fav"],
  favourite: ["favourite", "favorite", "fav"],
  favorite: ["favourite", "favorite", "fav"],
  color: ["color", "colour"],
  colour: ["color", "colour"],
  shoe: ["shoe", "size", "wear"],
  size: ["size", "shoe", "wear"],
  wear: ["wear", "size", "shoe"],
  eat: ["eat", "food", "restaurant", "dinner"],
  food: ["food", "eat", "restaurant", "dinner"],
  restaurant: ["restaurant", "eat", "food", "dinner"],
  dinner: ["dinner", "restaurant", "eat", "food"],
  coffee: ["coffee", "latte", "drink"],
  latte: ["latte", "coffee", "drink"],
  drink: ["drink", "coffee", "latte"],
  lipstick: ["lipstick", "shade", "makeup"],
  shade: ["shade", "lipstick", "makeup"],
  makeup: ["makeup", "lipstick", "shade"],
  song: ["song", "music", "listen"],
  music: ["music", "song", "listen"],
  flower: ["flower", "tulip", "flowers"],
  flowers: ["flowers", "flower", "tulip"],
  tulip: ["tulip", "flower", "flowers"],
};

/** Words worth matching, plus close synonyms. */
export function keywordsFrom(label: string): string[] {
  const words = label
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
  const extra = words.flatMap((word) => SYNONYMS[word] ?? []);
  return [...new Set([...words, ...extra])];
}

/**
 * Find the saved fact a plain-language question is about.
 * Returns null when nothing stored fits.
 */
export function matchFact(
  question: string,
  facts: KyndFact[],
): KyndFact | null {
  const asked = question.toLowerCase();
  let best: { fact: KyndFact; score: number } | null = null;

  for (const fact of facts) {
    let score = 0;
    const label = fact.label.toLowerCase();
    if (label && asked.includes(label)) score += 8;
    for (const key of fact.keywords) {
      if (key.length < 3) continue;
      if (asked.includes(key)) score += key.length;
    }
    if (score > (best?.score ?? 0)) best = { fact, score };
  }

  return best && best.score > 0 ? best.fact : null;
}

export const ASK_EMPTY = "I don't have that yet. Add it to their Kynd.";

export function answerFor(question: string, facts: KyndFact[]): string {
  const fact = matchFact(question, facts);
  if (!fact) return ASK_EMPTY;
  return `${fact.value}. You saved this as ${fact.label.toLowerCase()}.`;
}

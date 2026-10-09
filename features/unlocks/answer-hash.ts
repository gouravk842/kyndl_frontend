/** Shared with the backend public redact: trim, lowercase, SHA-256 hex. */

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

export async function hashAnswer(value: string): Promise<string> {
  const data = new TextEncoder().encode(normalizeAnswer(value));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function matchesAnswer(
  value: string,
  answers?: string[],
  hashes?: string[],
): Promise<boolean> {
  if (answers && answers.length > 0) {
    const norm = normalizeAnswer(value);
    return answers.some((a) => normalizeAnswer(a) === norm);
  }
  if (hashes && hashes.length > 0) {
    const hashed = await hashAnswer(value);
    return hashes.includes(hashed);
  }
  return false;
}

/** Keep plaintext for the owner, and store hashes the public page can check. */
export async function stampGateHashes(
  gate: { type: string; config?: unknown } | null,
): Promise<{ type: string; config?: unknown } | null> {
  if (!gate || !gate.config || typeof gate.config !== "object") return gate;
  const config = { ...(gate.config as Record<string, unknown>) };

  if (gate.type === "question" && Array.isArray(config.answers)) {
    const answers = config.answers.filter(
      (a): a is string => typeof a === "string",
    );
    config.answerHashes = await Promise.all(answers.map((a) => hashAnswer(a)));
  }

  if (gate.type === "crossword" && Array.isArray(config.entries)) {
    config.entries = await Promise.all(
      config.entries.map(async (entry) => {
        if (!entry || typeof entry !== "object") return entry;
        const row = { ...(entry as Record<string, unknown>) };
        if (typeof row.answer === "string" && row.answer.length > 0) {
          row.letters = row.answer.length;
          row.answerHash = await hashAnswer(row.answer);
        }
        return row;
      }),
    );
  }

  return { ...gate, config };
}

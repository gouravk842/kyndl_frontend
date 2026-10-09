const MAX_TITLE = 200;

/** Split the Keep sheet's one field into the title/note the API stores. */
export function splitKeepLine(text: string): { title: string; note: string } {
  const trimmed = text.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return { title: "", note: "" };
  const breakAt = trimmed.indexOf("\n");
  if (breakAt === -1) {
    return { title: trimmed.slice(0, MAX_TITLE), note: trimmed };
  }
  const first = trimmed.slice(0, breakAt).trim().slice(0, MAX_TITLE);
  const rest = trimmed.slice(breakAt + 1).trim();
  return { title: first, note: rest || first };
}

export function joinKeepLine(title: string, note: string): string {
  const t = title.trim();
  const n = note.trim();
  if (!t) return n;
  if (!n || n === t) return t;
  if (n.startsWith(t)) return n;
  return `${t}\n${n}`;
}

export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

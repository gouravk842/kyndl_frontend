"use client";

import { useEffect, useState } from "react";

/**
 * Reveals `text` one character at a time, as if it were being written live. The
 * slow reveal is half the magic of a Moment — it forces the reader to slow down.
 * Returns the visible slice and whether it has finished. Each line gets a fresh
 * mount in the approach (keyed), so this only needs to run forward from zero.
 */
export function useTypewriter(text: string, speedMs = 45) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  return { shown: text.slice(0, count), done: count >= text.length };
}

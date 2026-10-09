"use client";

import { useCallback, useEffect, useState } from "react";

import { dwellSeconds, type LanternConfig } from "../config";

export type StagePhase =
  | "closed"
  | "search"
  | "dedication"
  | "onstage"
  | "blackout"
  | "finale";

/**
 * Opening-night sequence for one lantern.
 *
 * Closed curtains, a searching spotlight, a title card on the empty podium,
 * then one memory at a time. Between memories the stage blacks out so
 * the next colour can bloom before the photo is lowered. The finale keeps the
 * last photo up. `ceremony` false (the builder's live rail) starts already open
 * and waits for a step before the finale, so typing doesn't get covered.
 */
export function useStageShow({
  config,
  reducedMotion,
  ceremony,
}: {
  config: LanternConfig;
  reducedMotion: boolean;
  ceremony: boolean;
}) {
  const panes = config.panes;
  const count = panes.length;
  const hasIntro = Boolean(
    config.title.trim() ||
    config.subtitle.trim() ||
    config.recipientName.trim(),
  );
  const dwell = dwellSeconds(config.motion?.autoSpin);

  const [phase, setPhase] = useState<StagePhase>(
    ceremony ? "closed" : "onstage",
  );
  const [index, setIndex] = useState(0);
  const [glowIndex, setGlowIndex] = useState(0);
  const [seen, setSeen] = useState<Record<string, true>>({});
  const [playing, setPlaying] = useState(dwell >= 2);
  const [holding, setHolding] = useState(false);
  const [knownCount, setKnownCount] = useState(count);

  // Panes were added to an empty draft, or the current index fell off the end.
  // Adjusted while rendering so the show doesn't wait a frame to catch up.
  if (count !== knownCount) {
    setKnownCount(count);
    if (knownCount === 0 && count > 0) {
      setPhase(ceremony ? "closed" : "onstage");
      setIndex(0);
      setGlowIndex(0);
      setSeen({});
    } else if (count > 0 && index >= count) {
      const last = count - 1;
      setIndex(last);
      setGlowIndex(last);
    }
  }

  const activeId = panes[index]?.id;
  const showing = phase === "onstage" || phase === "finale";
  if (count === knownCount && showing && activeId && !seen[activeId]) {
    setSeen({ ...seen, [activeId]: true });
  }

  useEffect(() => {
    if (phase !== "search" || reducedMotion) return;
    const t = window.setTimeout(() => {
      setPhase(hasIntro ? "dedication" : "onstage");
    }, 2200);
    return () => window.clearTimeout(t);
  }, [phase, reducedMotion, hasIntro]);

  useEffect(() => {
    if (phase !== "dedication") return;
    const t = window.setTimeout(
      () => setPhase("onstage"),
      reducedMotion ? 800 : 3400,
    );
    return () => window.clearTimeout(t);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "blackout") return;
    const t = window.setTimeout(() => {
      setIndex(glowIndex);
      setPhase("onstage");
    }, 720);
    return () => window.clearTimeout(t);
  }, [phase, glowIndex]);

  useEffect(() => {
    if (!ceremony || playing) return;
    if (phase !== "onstage" || count === 0 || index !== count - 1) return;
    const t = window.setTimeout(
      () => setPhase("finale"),
      reducedMotion ? 400 : 1700,
    );
    return () => window.clearTimeout(t);
  }, [ceremony, playing, phase, count, index, reducedMotion]);

  const begin = useCallback(() => {
    setIndex(0);
    setGlowIndex(0);
    if (reducedMotion) {
      setPhase(hasIntro ? "dedication" : "onstage");
      return;
    }
    setPhase("search");
  }, [reducedMotion, hasIntro]);

  const stepTo = useCallback(
    (next: number) => {
      if (reducedMotion) {
        setIndex(next);
        setGlowIndex(next);
        setPhase("onstage");
        return;
      }
      setGlowIndex(next);
      setPhase("blackout");
    },
    [reducedMotion],
  );

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (count === 0) return;

      if (phase === "closed") {
        begin();
        return;
      }
      if (phase === "search" || phase === "dedication") {
        setIndex(0);
        setGlowIndex(0);
        setPhase("onstage");
        return;
      }
      if (phase === "blackout") return;

      if (phase === "finale") {
        if (dir < 0 && count > 1) stepTo(count - 2);
        return;
      }

      const next = index + dir;
      if (next >= count) {
        setPhase("finale");
        return;
      }
      if (next < 0) return;
      stepTo(next);
    },
    [begin, count, index, phase, stepTo],
  );

  useEffect(() => {
    if (!playing || holding || phase !== "onstage" || count === 0) return;
    const pace = (dwell >= 2 ? dwell : 5) * 1000;
    const t = window.setTimeout(() => {
      if (index >= count - 1) {
        setPhase("finale");
        setPlaying(false);
        return;
      }
      advance(1);
    }, pace);
    return () => window.clearTimeout(t);
  }, [playing, holding, phase, dwell, index, count, advance]);

  const encore = useCallback(() => {
    setSeen({});
    setIndex(0);
    setGlowIndex(0);
    setPlaying(dwell >= 2);
    setPhase(ceremony ? "closed" : "onstage");
  }, [ceremony, dwell]);

  const togglePlay = useCallback(() => {
    setPlaying((on) => !on);
  }, []);

  return {
    phase,
    index,
    glowIndex,
    seen,
    playing,
    setHolding,
    advance,
    begin,
    encore,
    togglePlay,
  };
}

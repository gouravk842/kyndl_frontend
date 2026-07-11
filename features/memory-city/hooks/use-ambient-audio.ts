import { useCallback, useEffect, useRef } from "react";

import { useMemoryCityStore } from "../store";

/**
 * Procedural ambient sound for Memory City — no audio asset files.
 *
 * Everything is synthesised with the Web Audio API:
 *  - a low wind drone (looping filtered noise with a slow gain wobble)
 *  - a soft footstep tick (short filtered noise burst) while roaming
 *  - a gentle two-note chime when the tour arrives at a node
 *
 * The AudioContext is created lazily in `start()`, which must be called from a
 * user gesture (the enter click) per browser autoplay policy. A master gain node
 * follows the store's `muted` flag.
 */
export interface AmbientAudio {
  /** Create/resume the audio context and begin the wind drone. */
  start: () => void;
  /** Play a single footstep tick. */
  footstep: () => void;
  /** Play the arrival chime. */
  chime: () => void;
}

const MASTER_VOLUME = 0.5;

export function useAmbientAudio(): AmbientAudio {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const muted = useMemoryCityStore((s) => s.muted);

  // Keep the master gain in sync with the mute toggle.
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    master.gain.setTargetAtTime(
      muted ? 0 : MASTER_VOLUME,
      ctx.currentTime,
      0.1,
    );
  }, [muted]);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) {
      void ctxRef.current.resume();
      return;
    }

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = useMemoryCityStore.getState().muted ? 0 : MASTER_VOLUME;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;

    // --- Wind drone: looping pink-ish noise through a low-pass filter. ---
    const noiseLen = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < noiseLen; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.98 * last + 0.02 * white;
      data[i] = last * 3.5;
    }
    const wind = ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 480;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.18;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain).connect(windGain.gain);

    wind.connect(windFilter).connect(windGain).connect(master);
    wind.start();
    lfo.start();
  }, []);

  const footstep = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    const buffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * 0.08),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    src.connect(filter).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.13);
  }, []);

  const chime = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    // Soft two-note bell (perfect fifth) that fades over ~1.4s.
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const startAt = t + i * 0.07;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 1.4);
      osc.connect(gain).connect(master);
      osc.start(startAt);
      osc.stop(startAt + 1.5);
    });
  }, []);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, []);

  return { start, footstep, chime };
}

/**
 * Synthesised game SFX via the Web Audio API — no audio assets. Mirrors the
 * scrapbook's flip-sound approach: one lazily-created AudioContext, resumed on
 * the first user gesture. All sounds are short and fail silently.
 */
let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  peak: number,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur);
}

function safe(run: (ac: AudioContext, t: number) => void) {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();
    run(ac, ac.currentTime);
  } catch {
    // audio is non-essential
  }
}

/** Rattling dice — a few filtered noise ticks. */
export function playDice() {
  safe((ac, t) => {
    for (let i = 0; i < 5; i++) {
      const at = t + i * 0.06 + Math.random() * 0.02;
      const dur = 0.05;
      const frames = Math.floor(ac.sampleRate * dur);
      const buffer = ac.createBuffer(1, frames, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let f = 0; f < frames; f++) {
        data[f] = (Math.random() * 2 - 1) * (1 - f / frames);
      }
      const src = ac.createBufferSource();
      src.buffer = buffer;
      const band = ac.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1800 + Math.random() * 1200;
      band.Q.value = 1.2;
      const gain = ac.createGain();
      gain.gain.value = 0.12;
      src.connect(band);
      band.connect(gain);
      gain.connect(ac.destination);
      src.start(at);
      src.stop(at + dur);
    }
  });
}

/** A soft wooden tap as a token lands on a cell. */
export function playStep() {
  safe((ac, t) => tone(ac, 320, t, 0.08, "triangle", 0.06));
}

/** Bright two-note chirp when a star activity fires. */
export function playStar() {
  safe((ac, t) => {
    tone(ac, 660, t, 0.14, "sine", 0.12);
    tone(ac, 990, t + 0.1, 0.18, "sine", 0.12);
  });
}

/** Descending thunk for a capture. */
export function playCapture() {
  safe((ac, t) => {
    tone(ac, 440, t, 0.12, "sawtooth", 0.1);
    tone(ac, 220, t + 0.08, 0.2, "sawtooth", 0.1);
  });
}

/** Rising arpeggio when a token reaches home. */
export function playHome() {
  safe((ac, t) => {
    [523, 659, 784].forEach((f, i) =>
      tone(ac, f, t + i * 0.09, 0.18, "sine", 0.12),
    );
  });
}

/** Triumphant fanfare on game win. */
export function playWin() {
  safe((ac, t) => {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(ac, f, t + i * 0.12, 0.3, "triangle", 0.14),
    );
  });
}

/**
 * One AudioContext, unlocked from the pointer gesture. Impacts are a short
 * noise thud plus a tone so face, apology, and heart don't share one beep.
 */

type HitKind = "face" | "apology" | "sacred" | "miss";

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Call inside the pointerdown that starts a swing. */
export function unlockHitAudio() {
  const audio = context();
  if (audio && audio.state === "suspended") void audio.resume();
}

function noiseBuffer(audio: AudioContext): AudioBuffer {
  if (noise && noise.sampleRate === audio.sampleRate) return noise;
  const length = Math.floor(audio.sampleRate * 0.09);
  noise = audio.createBuffer(1, length, audio.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const env = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * env * env;
  }
  return noise;
}

export function playHitThud(kind: HitKind) {
  const audio = context();
  if (!audio || audio.state !== "running") return;
  const t = audio.currentTime;

  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio);
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value =
    kind === "sacred"
      ? 1400
      : kind === "miss"
        ? 380
        : kind === "apology"
          ? 900
          : 240;
  const gain = audio.createGain();
  const peak =
    kind === "miss"
      ? 0.04
      : kind === "sacred"
        ? 0.1
        : kind === "apology"
          ? 0.12
          : 0.2;
  gain.gain.setValueAtTime(peak, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  src.start(t);
  src.stop(t + 0.1);

  if (kind === "face" || kind === "apology") {
    const osc = audio.createOscillator();
    osc.type = kind === "apology" ? "sine" : "triangle";
    const f0 = kind === "apology" ? 620 : 110;
    const f1 = kind === "apology" ? 880 : 48;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + 0.12);
    const tone = audio.createGain();
    tone.gain.setValueAtTime(kind === "apology" ? 0.05 : 0.12, t);
    tone.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(tone);
    tone.connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

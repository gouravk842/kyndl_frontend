/**
 * Synthesised page-flip "swish" via the Web Audio API — no audio asset needed.
 * A short band-passed noise burst with a quick decay + rising sweep reads as a
 * page turn. Must be triggered from a user gesture (the AudioContext resumes on
 * the first flip the user causes).
 */
let ctx: AudioContext | null = null;

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

export function playFlipSound() {
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();

    const dur = 0.3;
    const frames = Math.floor(ac.sampleRate * dur);
    const buffer = ac.createBuffer(1, frames, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      // fade the noise toward the end so it tapers like paper settling
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }

    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.8;

    const gain = ac.createGain();
    const t = ac.currentTime;
    band.frequency.setValueAtTime(700, t);
    band.frequency.exponentialRampToValueAtTime(2600, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(band);
    band.connect(gain);
    gain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + dur);
  } catch {
    // audio is non-essential; ignore failures
  }
}

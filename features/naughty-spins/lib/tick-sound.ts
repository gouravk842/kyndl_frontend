/**
 * A short peg click, synthesised so the wheel needs no audio file.
 * The AudioContext is created on the first user gesture and stays quiet
 * until the player turns ticks on.
 */

let ctx: AudioContext | null = null;
let lastTick = 0;

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

/** Resume audio inside the spin click, so later ticks are allowed to play. */
export function primeTickAudio() {
  const ac = getCtx();
  if (ac?.state === "suspended") void ac.resume();
}

/** One soft click. Rapid pegs at the start of a spin are coalesced. */
export function playPegTick() {
  const now = performance.now();
  if (now - lastTick < 55) return;
  lastTick = now;

  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1480, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.028);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.035, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  } catch {
    // Ticks are optional. A blocked audio device should not stop the spin.
  }
}

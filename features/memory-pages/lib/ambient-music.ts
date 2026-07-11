/**
 * A soft, generative "music box" lullaby synthesised with the Web Audio API — no
 * audio asset needed (mirrors the page-flip "swish" the album already uses).
 *
 * Rather than a static held chord (which drones), it sprinkles gentle, felt-piano
 * notes drawn from a **major-pentatonic** scale — any combination of those notes
 * sounds consonant, so it can wander freely and never clash. Each note has a soft
 * attack and a long decay, fed through a low-pass and a feedback-delay reverb for
 * a warm, spacious tail. The timing is loosely randomised so it never loops
 * audibly. Kept faint so the music sits *under* the reading experience.
 *
 * Must be started from a user gesture (opening the album), which resumes the
 * AudioContext — browsers block audio that starts on its own.
 */
export type AmbientMusic = {
  /** Fade in and begin sprinkling notes (building + resuming on first call). */
  start: () => void;
  /** Fade out to silence and stop scheduling. */
  stop: () => void;
  /** Release audio resources. */
  dispose: () => void;
};

// C major pentatonic across ~1.5 octaves (C4 D4 E4 G4 A4 C5 D5 E5 G5), in Hz.
const SCALE = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99,
];
const MASTER = 0.85; // peak master gain — deliberately faint
const FADE_IN = 2.5;
const FADE_OUT = 1.4;

function pick(): number {
  return SCALE[Math.floor(Math.random() * SCALE.length)] ?? 440;
}

export function createAmbientMusic(): AmbientMusic {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let filter: BiquadFilterNode | null = null;
  let reverbIn: DelayNode | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;

  function build(): boolean {
    if (ctx) return true;
    if (typeof window === "undefined") return false;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return false;

    const ac = new AC();

    const out = ac.createGain();
    out.gain.value = 0; // silent until start() fades it up
    out.connect(ac.destination);

    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2000; // shave the highs so notes read as soft/felt
    lp.Q.value = 0.2;
    lp.connect(out);

    // A feedback delay makes a simple, mellow reverb tail.
    const delay = ac.createDelay(1);
    delay.delayTime.value = 0.33;
    const feedback = ac.createGain();
    feedback.gain.value = 0.36;
    const wet = ac.createGain();
    wet.gain.value = 0.5;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(lp);

    ctx = ac;
    master = out;
    filter = lp;
    reverbIn = delay;
    return true;
  }

  function note(freq: number, at: number, vel: number) {
    if (!ctx || !filter || !reverbIn) return;
    const osc = ctx.createOscillator();
    osc.type = "triangle"; // rounded, music-box-ish timbre
    osc.frequency.value = freq;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(vel, at + 0.015); // gentle pluck
    env.gain.exponentialRampToValueAtTime(0.0001, at + 2.8); // long decay

    osc.connect(env);
    env.connect(filter); // dry
    env.connect(reverbIn); // into the reverb
    osc.start(at);
    osc.stop(at + 3);
  }

  function schedule() {
    if (!ctx || !running) return;
    const now = ctx.currentTime;
    note(pick(), now + 0.02, 0.11);
    // Sometimes a soft companion note a beat later — a little two-note phrase.
    if (Math.random() < 0.4) note(pick(), now + 0.34, 0.07);
    // 1.3–2.6s of space between phrases keeps it calm.
    timer = setTimeout(schedule, 1300 + Math.random() * 1300);
  }

  function ramp(to: number, seconds: number) {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(to, now + seconds);
  }

  return {
    start() {
      if (!build() || !ctx) return;
      void ctx.resume();
      ramp(MASTER, FADE_IN);
      if (!running) {
        running = true;
        schedule();
      }
    },
    stop() {
      running = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      ramp(0, FADE_OUT);
    },
    dispose() {
      running = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (ctx) {
        void ctx.close();
        ctx = null;
        master = null;
        filter = null;
        reverbIn = null;
      }
    },
  };
}

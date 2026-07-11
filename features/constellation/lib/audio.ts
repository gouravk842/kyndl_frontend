/**
 * Constellation — generative soundscape (Web Audio, no React).
 *
 * A slow ambient pad that breathes and swells as more of the sky is read, plus
 * a soft chime each time a star opens, pitched up a pentatonic scale so any
 * order of taps still sounds consonant. Everything is synthesized — no audio
 * files to ship or buffer.
 *
 * The `AudioContext` is created lazily on `resume()` (called from a user
 * gesture) to satisfy browser autoplay policies; nothing here touches `window`
 * until then, so it's safe to construct during SSR.
 */

// A4-based pentatonic so sequential chimes always feel resolved.
const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9];
const A4 = 440;

function noteFrequency(step: number): number {
  const scale = PENTATONIC_SEMITONES;
  const octave = Math.floor(step / scale.length);
  const semis =
    scale[((step % scale.length) + scale.length) % scale.length] ?? 0;
  return A4 * Math.pow(2, (semis + octave * 12) / 12);
}

type Ctor = typeof AudioContext;

export class SkyAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private pad: OscillatorNode[] = [];
  private windSource: AudioBufferSourceNode | null = null;
  private muted = true;
  private intensity = 0;

  /** Create the context + start the pad. Must be called from a user gesture. */
  resume(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx: Ctor | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.buildPad();
    }
    void this.ctx.resume();
    this.applyMasterGain();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterGain();
  }

  isMuted(): boolean {
    return this.muted;
  }

  /** Swell the pad with reading progress (0–1). */
  setIntensity(value: number): void {
    this.intensity = Math.max(0, Math.min(1, value));
    if (!this.ctx || !this.padGain) return;
    const target = 0.04 + this.intensity * 0.12;
    this.padGain.gain.setTargetAtTime(target, this.ctx.currentTime, 1.5);
  }

  /** A single bright tone — one per star opened, climbing the scale. */
  chime(step: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = noteFrequency(step + 7); // an octave or so above the pad

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 1.9);
  }

  /** A warm shimmer when the last star lands and the shape ignites. */
  finale(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    [0, 2, 4].forEach((step, i) => {
      const now = ctx.currentTime + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = noteFrequency(step + 9);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + 3.1);
    });
  }

  dispose(): void {
    this.pad.forEach((o) => {
      try {
        o.stop();
      } catch {
        // already stopped
      }
    });
    this.pad = [];
    try {
      this.windSource?.stop();
    } catch {
      // already stopped
    }
    this.windSource = null;
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.padGain = null;
  }

  private buildPad(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    // A soft low chord through a lowpass, with a slow LFO breathing its volume.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;

    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.04;
    this.padGain.connect(filter).connect(this.master);

    const chord = [noteFrequency(-5), noteFrequency(0), noteFrequency(2)];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = (i - 1) * 6; // gentle chorus
      osc.connect(this.padGain as GainNode);
      osc.start();
      this.pad.push(osc);
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(this.padGain.gain);
    lfo.start();
    this.pad.push(lfo);

    this.buildWind(filter);
  }

  /**
   * A slow wind layer: looping noise through a band-pass, its volume breathing
   * on a very slow LFO so it rises and falls like a real breeze over the meadow.
   */
  private buildWind(destination: AudioNode): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const seconds = 2;
    const buffer = ctx.createBuffer(
      1,
      ctx.sampleRate * seconds,
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 500;
    band.Q.value = 0.7;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;

    const gust = ctx.createOscillator();
    const gustGain = ctx.createGain();
    gust.frequency.value = 0.05; // ~20s breaths
    gustGain.gain.value = 0.035;
    gust.connect(gustGain).connect(windGain.gain);

    noise.connect(band).connect(windGain).connect(destination);
    noise.start();
    gust.start();
    this.pad.push(gust);
    this.windSource = noise;
  }

  private applyMasterGain(): void {
    if (!this.ctx || !this.master) return;
    const target = this.muted ? 0 : 0.5;
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
  }
}

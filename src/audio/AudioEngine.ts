/**
 * The master audio engine.
 *
 * Owns the AudioContext and the master signal chain:
 *
 *   ChoirDrone → envelope (breath-like swell) → ┬→ dry ─────────────┐
 *                                               └→ church reverb → wet ┤
 *                                                                      ↓
 *                                          master mix → limiter → volume → out
 *
 * The envelope gives a gentle fade in/out so the drone breathes in and never
 * clicks; a limiter guards the output from the additive build-up of many voices
 * plus a long reverb tail.
 */

import { ChoirDrone, type ChoirParams } from "./ChoirDrone";
import { createChurchImpulse } from "./reverb";
import type { Vowel } from "./formants";

const ATTACK = 1.8; // seconds — slow, choir-like swell
const RELEASE = 1.4;

export interface EngineConfig extends ChoirParams {
  /** Reverb wet amount, 0..1. */
  reverbMix: number;
  /** Master volume, 0..1. */
  volume: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private choir: ChoirDrone | null = null;
  private envelope!: GainNode;
  private dryGain!: GainNode;
  private wetGain!: GainNode;
  private convolver!: ConvolverNode;
  private master!: GainNode;
  private config: EngineConfig;
  private playing = false;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: EngineConfig) {
    this.config = { ...config };
  }

  /** Lazily create the context + graph on the first user gesture. */
  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    this.ctx = ctx;

    this.choir = new ChoirDrone(ctx, this.config);

    this.envelope = ctx.createGain();
    this.envelope.gain.value = 0;

    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = createChurchImpulse(ctx, { seconds: 3.4, decay: 2.2 });

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.25;

    this.master = ctx.createGain();
    this.master.gain.value = this.config.volume;

    // Wiring
    this.choir.output.connect(this.envelope);
    this.envelope.connect(this.dryGain);
    this.envelope.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.dryGain.connect(limiter);
    this.wetGain.connect(limiter);
    limiter.connect(this.master);
    this.master.connect(ctx.destination);

    this.applyReverbMix();
    return ctx;
  }

  private applyReverbMix(): void {
    const mix = this.config.reverbMix;
    this.dryGain.gain.value = 1 - 0.4 * mix;
    this.wetGain.gain.value = mix;
  }

  /** Start the drone at the given frequency with a slow swell. */
  async play(freq: number): Promise<void> {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.choir!.start(freq);
    const t = ctx.currentTime;
    this.envelope.gain.cancelScheduledValues(t);
    this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
    this.envelope.gain.linearRampToValueAtTime(1, t + ATTACK);
    this.playing = true;
  }

  /** Fade out and stop the drone. */
  stop(): void {
    if (!this.ctx || !this.choir || !this.playing) return;
    const t = this.ctx.currentTime;
    this.envelope.gain.cancelScheduledValues(t);
    this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
    this.envelope.gain.linearRampToValueAtTime(0, t + RELEASE);
    this.playing = false;
    const choir = this.choir;
    this.fadeTimer = setTimeout(() => choir.stop(), (RELEASE + 0.05) * 1000);
  }

  setPitch(freq: number): void {
    this.choir?.setPitch(freq);
  }

  setVowel(vowel: Vowel): void {
    this.config.vowel = vowel;
    this.choir?.setVowel(vowel);
  }

  setVibrato(depth: number, rate: number): void {
    this.config.vibratoDepth = depth;
    this.config.vibratoRate = rate;
    this.choir?.setVibrato(depth, rate);
  }

  setBreath(level: number): void {
    this.config.breath = level;
    this.choir?.setBreath(level);
  }

  setVoiceCount(count: number): void {
    this.config.voiceCount = count;
    this.choir?.setVoiceCount(count);
  }

  setReverbMix(mix: number): void {
    this.config.reverbMix = mix;
    if (this.ctx) this.applyReverbMix();
  }

  setVolume(volume: number): void {
    this.config.volume = volume;
    if (this.ctx) {
      this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  get isPlaying(): boolean {
    return this.playing;
  }
}

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

export interface EngineConfig extends ChoirParams {
  /** Reverb wet amount, 0..1. */
  reverbMix: number;
  /** Master volume, 0..1. */
  volume: number;
  /** Seconds for the choir to swell in when starting. */
  fadeIn: number;
  /** Seconds for the choir to fade out when stopping. */
  fadeOut: number;
  /** Seconds the choir takes to glide from one ison note to another. */
  glide: number;
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

    // Gentle warmth: roll off the extreme top so the mix sounds rounded and
    // wooden, like voices in a stone church rather than a bright synth.
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = 6000;
    warmth.Q.value = 0.5;

    this.master = ctx.createGain();
    this.master.gain.value = this.config.volume;

    // Wiring
    this.choir.output.connect(this.envelope);
    this.envelope.connect(this.dryGain);
    this.envelope.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.dryGain.connect(warmth);
    this.wetGain.connect(warmth);
    warmth.connect(limiter);
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
    const fadeIn = this.config.fadeIn;
    this.choir!.start(freq, fadeIn);
    const t = ctx.currentTime;
    this.envelope.gain.cancelScheduledValues(t);
    this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
    this.envelope.gain.linearRampToValueAtTime(1, t + fadeIn);
    this.playing = true;
  }

  /** Fade out and stop the drone. */
  stop(): void {
    if (!this.ctx || !this.choir || !this.playing) return;
    const t = this.ctx.currentTime;
    const fadeOut = this.config.fadeOut;
    this.envelope.gain.cancelScheduledValues(t);
    this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
    this.envelope.gain.linearRampToValueAtTime(0, t + fadeOut);
    this.playing = false;
    const choir = this.choir;
    this.fadeTimer = setTimeout(() => choir.stop(), (fadeOut + 0.05) * 1000);
  }

  setPitch(freq: number): void {
    this.choir?.setPitch(freq, this.config.glide);
  }

  setFade(fadeIn: number, fadeOut: number, glide: number): void {
    this.config.fadeIn = fadeIn;
    this.config.fadeOut = fadeOut;
    this.config.glide = glide;
  }

  /**
   * Play a short, pure sine tone at `freq` — a clean pitch reference for
   * warming-up or tuning the voice. Independent of the choir, so it works
   * whether the ison is sounding or not.
   */
  playReference(freq: number, duration = 2): void {
    const ctx = this.ensure();
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(this.master);
    const t = ctx.currentTime;
    const peak = 0.25;
    const ramp = 0.06;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peak, t + ramp);
    gain.gain.setValueAtTime(peak, t + duration - ramp);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.05);
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

  setBass(level: number): void {
    this.config.bass = level;
    this.choir?.setBass(level);
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

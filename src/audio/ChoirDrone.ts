/**
 * A choir of ison singers.
 *
 * Stacks N {@link IsonVoice}s into an ensemble: each voice gets a slightly
 * different detune, stereo position and vibrato rate/phase, so the result has
 * the shimmering thickness of several people holding the same note rather than
 * one sterile tone. Changing the ison crossfades and glides the whole choir,
 * the way real isokratai slide the drone to its new resting note.
 */

import { IsonVoice, type VoiceConfig } from "./IsonVoice";
import { formantsFor, type Vowel } from "./formants";

export interface ChoirParams {
  voiceCount: number;
  vowel: Vowel;
  vibratoDepth: number; // cents
  vibratoRate: number; // Hz
  breath: number; // 0..1
  /** Total detune spread across the choir, in cents. */
  spread: number;
  /** Level (0..1) of a sustained bass voice one octave below the ison. */
  bass: number;
}

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export class ChoirDrone {
  private ctx: AudioContext;
  private noise: AudioBuffer;
  private voices: IsonVoice[] = [];
  private bassVoice: IsonVoice | null = null;
  private bassGain: GainNode;
  private params: ChoirParams;
  private freq = 130.81;
  private sounding = false;

  /** The choir's mix bus; connect this into the engine's reverb/master chain. */
  readonly output: GainNode;

  constructor(ctx: AudioContext, params: ChoirParams) {
    this.ctx = ctx;
    this.params = { ...params };
    this.noise = createNoiseBuffer(ctx);
    this.output = ctx.createGain();
    this.output.gain.value = 1;
    this.bassGain = ctx.createGain();
    this.bassGain.gain.value = params.bass;
    this.bassGain.connect(this.output);
    this.build();
  }

  private build(): void {
    const { voiceCount, spread, vibratoDepth, vibratoRate, breath, vowel } =
      this.params;
    const formants = formantsFor(vowel);
    for (let i = 0; i < voiceCount; i++) {
      // Distribute detune symmetrically across the choir, then jitter slightly.
      const pos = voiceCount === 1 ? 0 : i / (voiceCount - 1) - 0.5; // -0.5..0.5
      const detuneCents = pos * spread + (Math.random() - 0.5) * 3;
      const pan = voiceCount === 1 ? 0 : pos * 1.6; // spread across the field
      const config: VoiceConfig = {
        detuneCents,
        pan: Math.max(-1, Math.min(1, pan)),
        vibratoRate: vibratoRate * (0.9 + Math.random() * 0.2),
        vibratoDepth: vibratoDepth * (0.85 + Math.random() * 0.3),
        driftRate: 0.1 + Math.random() * 0.25,
        driftDepth: 4 + Math.random() * 4,
        breathLevel: breath,
        formants,
      };
      const voice = new IsonVoice(this.ctx, this.noise, config);
      voice.connect(this.output);
      this.voices.push(voice);
    }

    // A single, steady bass voice an octave below — the choir's foundation.
    this.bassVoice = new IsonVoice(this.ctx, this.noise, {
      detuneCents: 0,
      pan: 0,
      vibratoRate: vibratoRate * 0.85,
      vibratoDepth: vibratoDepth * 0.5,
      driftRate: 0.08,
      driftDepth: 3,
      breathLevel: breath * 0.5,
      formants: formantsFor("oo"),
    });
    this.bassVoice.connect(this.bassGain);
  }

  private teardown(when: number): void {
    for (const v of this.voices) {
      v.stop(when);
      v.disconnect();
    }
    this.voices = [];
    if (this.bassVoice) {
      this.bassVoice.stop(when);
      this.bassVoice.disconnect();
      this.bassVoice = null;
    }
  }

  /** Move the ison to a new frequency, gliding over `glide` seconds. */
  setPitch(freq: number, glide = 0.18): void {
    this.freq = freq;
    for (const v of this.voices) v.setFrequency(freq, glide);
    this.bassVoice?.setFrequency(freq / 2, glide);
  }

  setVowel(vowel: Vowel): void {
    this.params.vowel = vowel;
    const formants = formantsFor(vowel);
    for (const v of this.voices) v.setVowel(formants);
  }

  setVibrato(depth: number, rate: number): void {
    this.params.vibratoDepth = depth;
    this.params.vibratoRate = rate;
    for (const v of this.voices) v.setVibrato(depth, rate);
    this.bassVoice?.setVibrato(depth * 0.5, rate * 0.85);
  }

  setBreath(level: number): void {
    this.params.breath = level;
    for (const v of this.voices) v.setBreath(level);
    this.bassVoice?.setBreath(level * 0.5);
  }

  setBass(level: number): void {
    this.params.bass = level;
    this.bassGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.1);
  }

  /** Rebuild the ensemble with a new singer count (seamless if sounding). */
  setVoiceCount(count: number): void {
    if (count === this.params.voiceCount) return;
    this.params.voiceCount = count;
    const t = this.ctx.currentTime;
    this.teardown(t);
    this.build();
    if (this.sounding) {
      for (const v of this.voices) v.start(this.freq, t, 0.3);
      this.bassVoice?.start(this.freq / 2, t, 0.3);
    }
  }

  start(freq: number, fadeIn = 1.0): void {
    this.freq = freq;
    const t = this.ctx.currentTime;
    for (const v of this.voices) v.start(freq, t, fadeIn);
    this.bassVoice?.start(freq / 2, t, fadeIn);
    this.sounding = true;
  }

  stop(): void {
    // Voices are stopped by the engine's amplitude fade; cut oscillators after.
    const t = this.ctx.currentTime + 1.2;
    this.teardown(t);
    this.build(); // rebuild fresh oscillators ready for next start
    this.sounding = false;
  }

  get isSounding(): boolean {
    return this.sounding;
  }
}

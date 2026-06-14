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
  }

  private teardown(when: number): void {
    for (const v of this.voices) {
      v.stop(when);
      v.disconnect();
    }
    this.voices = [];
  }

  /** Move the ison to a new frequency, gliding over `glide` seconds. */
  setPitch(freq: number, glide = 0.18): void {
    this.freq = freq;
    for (const v of this.voices) v.setFrequency(freq, glide);
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
  }

  setBreath(level: number): void {
    this.params.breath = level;
    for (const v of this.voices) v.setBreath(level);
  }

  /** Rebuild the ensemble with a new singer count (seamless if sounding). */
  setVoiceCount(count: number): void {
    if (count === this.params.voiceCount) return;
    this.params.voiceCount = count;
    const t = this.ctx.currentTime;
    this.teardown(t);
    this.build();
    if (this.sounding) {
      for (const v of this.voices) v.start(this.freq, t);
    }
  }

  start(freq: number): void {
    this.freq = freq;
    const t = this.ctx.currentTime;
    for (const v of this.voices) v.start(freq, t);
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

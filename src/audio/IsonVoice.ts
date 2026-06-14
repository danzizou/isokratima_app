/**
 * A single synthesised ison singer.
 *
 * Signal path:
 *   2 detuned sawtooth oscillators  →  source gain
 *     → bank of parallel band-pass formant filters (vocal timbre)
 *     → voice gain  →  stereo panner  →  (choir bus)
 *   + a soft band-passed breath-noise layer mixed in for air.
 *
 * Pitch is wobbled by a vibrato LFO and a much slower random drift LFO so the
 * voice never sits perfectly still — the cue our ear reads as "human".
 */

import type { Formant } from "./formants";
import { voiceWave } from "./voiceWave";

export interface VoiceConfig {
  /** Static detune (cents) that spreads this voice within the choir. */
  detuneCents: number;
  /** Stereo position, -1 (left) .. 1 (right). */
  pan: number;
  /** Vibrato rate in Hz (per-voice, slightly randomised). */
  vibratoRate: number;
  /** Vibrato depth in cents. */
  vibratoDepth: number;
  /** Slow drift rate in Hz. */
  driftRate: number;
  /** Slow drift depth in cents. */
  driftDepth: number;
  /** Breath-noise level (0..1). */
  breathLevel: number;
  formants: Formant[];
}

export class IsonVoice {
  private ctx: AudioContext;
  private osc1: OscillatorNode;
  private osc2: OscillatorNode;
  private sourceGain: GainNode;
  private filters: BiquadFilterNode[] = [];
  private filterGains: GainNode[] = [];
  private voiceGain: GainNode;
  private panner: StereoPannerNode;
  private vibratoLfo: OscillatorNode;
  private vibratoGain: GainNode;
  private driftLfo: OscillatorNode;
  private driftGain: GainNode;
  private shimmerLfo: OscillatorNode;
  private shimmerGain: GainNode;
  private breath: AudioBufferSourceNode;
  private breathFilter: BiquadFilterNode;
  private breathGain: GainNode;
  private started = false;

  readonly output: GainNode;

  constructor(ctx: AudioContext, noiseBuffer: AudioBuffer, config: VoiceConfig) {
    this.ctx = ctx;

    // --- tone source: two saws, one slightly detuned, for inner richness ---
    this.osc1 = ctx.createOscillator();
    this.osc2 = ctx.createOscillator();
    const wave = voiceWave(ctx);
    this.osc1.setPeriodicWave(wave);
    this.osc2.setPeriodicWave(wave);
    this.osc1.detune.value = config.detuneCents;
    this.osc2.detune.value = config.detuneCents + 6; // gentle internal chorus

    this.sourceGain = ctx.createGain();
    this.sourceGain.gain.value = 0.5;
    this.osc1.connect(this.sourceGain);
    this.osc2.connect(this.sourceGain);

    // --- vibrato + slow random drift, summed onto both oscillators' detune ---
    this.vibratoLfo = ctx.createOscillator();
    this.vibratoLfo.type = "sine";
    this.vibratoLfo.frequency.value = config.vibratoRate;
    this.vibratoGain = ctx.createGain();
    this.vibratoGain.gain.value = config.vibratoDepth;
    this.vibratoLfo.connect(this.vibratoGain);

    this.driftLfo = ctx.createOscillator();
    this.driftLfo.type = "sine";
    this.driftLfo.frequency.value = config.driftRate;
    this.driftGain = ctx.createGain();
    this.driftGain.gain.value = config.driftDepth;
    this.driftLfo.connect(this.driftGain);

    this.vibratoGain.connect(this.osc1.detune);
    this.vibratoGain.connect(this.osc2.detune);
    this.driftGain.connect(this.osc1.detune);
    this.driftGain.connect(this.osc2.detune);

    // --- formant filter bank (parallel band-passes summed) ---
    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.value = 1;
    this.buildFormants(config.formants);

    // Slow amplitude shimmer — the gentle swell of a held human breath.
    this.shimmerLfo = ctx.createOscillator();
    this.shimmerLfo.type = "sine";
    this.shimmerLfo.frequency.value = 0.07 + Math.random() * 0.13;
    this.shimmerGain = ctx.createGain();
    this.shimmerGain.gain.value = 0.06;
    this.shimmerLfo.connect(this.shimmerGain);
    this.shimmerGain.connect(this.voiceGain.gain);

    // --- breath / air layer ---
    this.breath = ctx.createBufferSource();
    this.breath.buffer = noiseBuffer;
    this.breath.loop = true;
    this.breathFilter = ctx.createBiquadFilter();
    this.breathFilter.type = "bandpass";
    this.breathFilter.frequency.value = 1200;
    this.breathFilter.Q.value = 0.7;
    this.breathGain = ctx.createGain();
    this.breathGain.gain.value = config.breathLevel;
    this.breath.connect(this.breathFilter);
    this.breathFilter.connect(this.breathGain);
    this.breathGain.connect(this.voiceGain);

    // --- panning + output ---
    this.panner = ctx.createStereoPanner();
    this.panner.pan.value = config.pan;
    this.voiceGain.connect(this.panner);

    this.output = ctx.createGain();
    this.output.gain.value = 1;
    this.panner.connect(this.output);
  }

  private buildFormants(formants: Formant[]): void {
    for (const f of formants) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = f.freq;
      filter.Q.value = Math.max(0.5, f.freq / f.bandwidth);
      const g = this.ctx.createGain();
      g.gain.value = f.gain;
      this.sourceGain.connect(filter);
      filter.connect(g);
      g.connect(this.voiceGain);
      this.filters.push(filter);
      this.filterGains.push(g);
    }
  }

  /** Set the sung pitch, gliding (portamento) over `glide` seconds. */
  setFrequency(freq: number, glide = 0.12): void {
    const t = this.ctx.currentTime;
    for (const osc of [this.osc1, this.osc2]) {
      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setValueAtTime(Math.max(20, osc.frequency.value), t);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, freq),
        t + Math.max(0.01, glide),
      );
    }
  }

  /** Smoothly retune the formant bank for a new vowel. */
  setVowel(formants: Formant[]): void {
    const t = this.ctx.currentTime;
    for (let i = 0; i < this.filters.length && i < formants.length; i++) {
      const f = formants[i];
      this.filters[i].frequency.setTargetAtTime(f.freq, t, 0.08);
      this.filters[i].Q.setTargetAtTime(Math.max(0.5, f.freq / f.bandwidth), t, 0.08);
      this.filterGains[i].gain.setTargetAtTime(f.gain, t, 0.08);
    }
  }

  setVibrato(depthCents: number, rateHz: number): void {
    const t = this.ctx.currentTime;
    this.vibratoGain.gain.setTargetAtTime(depthCents, t, 0.1);
    this.vibratoLfo.frequency.setTargetAtTime(rateHz, t, 0.1);
  }

  setBreath(level: number): void {
    this.breathGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.1);
  }

  start(freq: number, when: number): void {
    if (this.started) return;
    this.started = true;
    this.osc1.frequency.value = freq;
    this.osc2.frequency.value = freq;

    // Humanised entrance: each singer joins after a small, random delay and
    // fades in over a slightly different time, so the choir gathers rather than
    // snapping on all at once.
    const delay = Math.random() * 0.6;
    const fade = 0.5 + Math.random() * 0.9;
    this.output.gain.cancelScheduledValues(when);
    this.output.gain.setValueAtTime(0.0001, when);
    this.output.gain.setValueAtTime(0.0001, when + delay);
    this.output.gain.linearRampToValueAtTime(1, when + delay + fade);

    this.osc1.start(when);
    this.osc2.start(when);
    this.vibratoLfo.start(when);
    this.driftLfo.start(when);
    this.shimmerLfo.start(when);
    this.breath.start(when);
  }

  stop(when: number): void {
    if (!this.started) return;
    for (const n of [
      this.osc1,
      this.osc2,
      this.vibratoLfo,
      this.driftLfo,
      this.shimmerLfo,
      this.breath,
    ]) {
      try {
        n.stop(when);
      } catch {
        /* already stopped */
      }
    }
  }

  connect(dest: AudioNode): void {
    this.output.connect(dest);
  }

  disconnect(): void {
    this.output.disconnect();
  }
}

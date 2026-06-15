/**
 * A glottal-style periodic waveform for the voice oscillators.
 *
 * A raw sawtooth (harmonics ∝ 1/n) sounds buzzy and electronic. A real glottal
 * source rolls its upper harmonics off more steeply, which — once shaped by the
 * vowel formants — reads as a warm human tone rather than a synth. We build that
 * spectrum once per AudioContext and cache it.
 */

const cache = new WeakMap<BaseAudioContext, PeriodicWave>();

export function voiceWave(ctx: BaseAudioContext): PeriodicWave {
  const cached = cache.get(ctx);
  if (cached) return cached;

  const harmonics = 20;
  const real = new Float32Array(harmonics + 1);
  const imag = new Float32Array(harmonics + 1);
  for (let n = 1; n <= harmonics; n++) {
    // Sawtooth-like 1/n falloff with a steeper exponential roll-off so the
    // upper partials don't excite formant ringing as bright hiss.
    imag[n] = (1 / n) * Math.exp(-n * 0.28);
  }
  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  cache.set(ctx, wave);
  return wave;
}

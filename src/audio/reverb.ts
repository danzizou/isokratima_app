/**
 * Procedurally-generated convolution reverb.
 *
 * Rather than ship a licensed impulse-response recording, we synthesise one:
 * stereo noise shaped by an exponential decay envelope. With a long decay and a
 * gentle low-pass tilt this gives the warm, enveloping tail of a stone church —
 * the acoustic in which Byzantine chant naturally lives.
 */

export interface ReverbOptions {
  /** Reverberation time in seconds (length of the tail). */
  seconds: number;
  /** Decay curve steepness; higher = faster initial decay. */
  decay: number;
}

export function createChurchImpulse(
  ctx: BaseAudioContext,
  { seconds, decay }: ReverbOptions,
): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const impulse = ctx.createBuffer(2, length, rate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    // A short pre-delay-free build, then exponential decay of decorrelated noise.
    // Two cascaded one-pole low-passes make the tail much darker, so the reverb
    // sounds like stone walls rather than bright noise.
    let lp1 = 0;
    let lp2 = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const envelope = Math.pow(1 - t, decay);
      const white = (Math.random() * 2 - 1) * 0.5;
      lp1 += 0.12 * (white - lp1);
      lp2 += 0.18 * (lp1 - lp2);
      data[i] = lp2 * envelope;
    }
  }
  return impulse;
}

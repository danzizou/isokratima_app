/**
 * Vowel formant tables for a low (bass/baritone) singing voice.
 *
 * A sung vowel is characterised by its formants — resonant peaks in the
 * spectrum. By running a harmonically-rich oscillator through a bank of
 * band-pass filters tuned to these peaks, a plain sawtooth takes on a vocal
 * timbre. Values are adapted from the classic CSound bass-voice formant tables.
 */

export interface Formant {
  /** Centre frequency (Hz). */
  freq: number;
  /** Linear peak gain (0..1). */
  gain: number;
  /** Bandwidth (Hz); the filter Q is freq / bandwidth. */
  bandwidth: number;
}

export type Vowel = "ah" | "oh" | "oo" | "eh" | "ee" | "hum";

export const VOWEL_LABELS: Record<Vowel, string> = {
  ah: "Α — ah",
  oh: "Ο — oh",
  oo: "Ου — oo",
  eh: "Ε — eh",
  ee: "Ι — ee",
  hum: "Μ — hum",
};

function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

interface RawFormant {
  freq: number;
  db: number;
  bw: number;
}

const RAW: Record<Vowel, RawFormant[]> = {
  ah: [
    { freq: 600, db: 0, bw: 60 },
    { freq: 1040, db: -7, bw: 70 },
    { freq: 2250, db: -9, bw: 110 },
    { freq: 2450, db: -9, bw: 120 },
  ],
  eh: [
    { freq: 400, db: 0, bw: 40 },
    { freq: 1620, db: -12, bw: 80 },
    { freq: 2400, db: -9, bw: 100 },
    { freq: 2800, db: -12, bw: 120 },
  ],
  ee: [
    { freq: 250, db: 0, bw: 60 },
    { freq: 1750, db: -30, bw: 90 },
    { freq: 2600, db: -16, bw: 100 },
    { freq: 3050, db: -22, bw: 120 },
  ],
  oh: [
    { freq: 400, db: 0, bw: 40 },
    { freq: 750, db: -11, bw: 80 },
    { freq: 2400, db: -21, bw: 100 },
    { freq: 2600, db: -20, bw: 120 },
  ],
  // Warm, rounded "oo" — the default; it blends seamlessly as a drone.
  oo: [
    { freq: 350, db: 0, bw: 40 },
    { freq: 600, db: -15, bw: 80 },
    { freq: 2400, db: -28, bw: 100 },
    { freq: 2675, db: -26, bw: 120 },
  ],
  // Closed-mouth hum: a strong low resonance with a soft nasal peak.
  hum: [
    { freq: 280, db: 0, bw: 50 },
    { freq: 1100, db: -18, bw: 100 },
    { freq: 2400, db: -34, bw: 120 },
    { freq: 2900, db: -38, bw: 140 },
  ],
};

export function formantsFor(vowel: Vowel): Formant[] {
  return RAW[vowel].map((f) => ({
    freq: f.freq,
    gain: dbToGain(f.db),
    bandwidth: f.bw,
  }));
}

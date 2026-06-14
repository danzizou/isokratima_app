/**
 * Byzantine music theory — the moria (μόρια) system.
 *
 * The octave is divided into 72 moria. A pitch interval of `m` moria is the
 * frequency ratio 2^(m/72). This is the theoretical division used by the
 * Chrysanthine "New Method" and the 1881 Patriarchal committee, and lets us
 * place the parallage (Νη Πα Βου Γα Δι Κε Ζω Νη') at their true, non-equal
 * tempered positions for each genus (scale family).
 */

export const MORIA_PER_OCTAVE = 72;

export type ScaleFamily =
  | "diatonic"
  | "softChromatic"
  | "hardChromatic"
  | "enharmonic";

export interface ParallageNote {
  /** Latin transliteration, e.g. "Ni", "Pa". */
  name: string;
  /** Greek name, e.g. "Νη", "Πα". */
  greek: string;
  /** Western solfège + note-letter equivalent, e.g. "Do (C)". */
  western: string;
  /** Index 0..7 within an octave (Ni .. Ni'). */
  degree: number;
}

/**
 * The eight parallage degrees of one octave. The diatonic Ni corresponds to
 * Western Do (C); the others follow the customary mapping. Ni' (index 7) is the
 * octave of Ni.
 */
export const PARALLAGE: ParallageNote[] = [
  { name: "Ni", greek: "Νη", western: "Do (C)", degree: 0 },
  { name: "Pa", greek: "Πα", western: "Re (D)", degree: 1 },
  { name: "Vou", greek: "Βου", western: "Mi (E)", degree: 2 },
  { name: "Ga", greek: "Γα", western: "Fa (F)", degree: 3 },
  { name: "Di", greek: "Δι", western: "Sol (G)", degree: 4 },
  { name: "Ke", greek: "Κε", western: "La (A)", degree: 5 },
  { name: "Zo", greek: "Ζω", western: "Si (B)", degree: 6 },
  { name: "Ni'", greek: "Νη'", western: "Do' (C')", degree: 7 },
];

/**
 * Absolute moria position of each parallage degree [Ni, Pa, Vou, Ga, Di, Ke,
 * Zo, Ni'] anchored at Ni = 0, for each genus. Each scale closes the octave at
 * 72 moria.
 *
 *  - diatonic       12-10-8-12-12-10-8   (natural diatonic scale)
 *  - soft chromatic  8-14-8-12-8-14-8
 *  - hard chromatic  6-20-4-12-6-20-4
 *  - enharmonic     12-12-6-12-12-6-12
 */
export const SCALE_MORIA: Record<ScaleFamily, number[]> = {
  diatonic: [0, 12, 22, 30, 42, 54, 64, 72],
  softChromatic: [0, 8, 22, 30, 42, 50, 64, 72],
  hardChromatic: [0, 6, 26, 30, 42, 48, 68, 72],
  enharmonic: [0, 12, 24, 30, 42, 54, 60, 72],
};

export const SCALE_FAMILY_LABEL: Record<ScaleFamily, string> = {
  diatonic: "Diatonic",
  softChromatic: "Soft Chromatic",
  hardChromatic: "Hard Chromatic",
  enharmonic: "Enharmonic",
};

/** Frequency ratio for an interval of `moria` moria. */
export function moriaToRatio(moria: number): number {
  return Math.pow(2, moria / MORIA_PER_OCTAVE);
}

/**
 * Frequency (Hz) of a parallage degree in a given genus.
 *
 * @param family       the genus / scale family
 * @param degree       0..7 (Ni .. Ni'); values outside wrap by octaves
 * @param niBaseHz     frequency of Ni (the diapason reference)
 * @param octaveShift  whole-octave transposition (e.g. -1 for one octave down)
 */
export function noteFrequency(
  family: ScaleFamily,
  degree: number,
  niBaseHz: number,
  octaveShift = 0,
): number {
  const scale = SCALE_MORIA[family];
  // Support degrees beyond a single octave by wrapping and adding octaves.
  const octaves = Math.floor(degree / 7);
  const idx = ((degree % 7) + 7) % 7;
  const moria = scale[idx] + octaves * MORIA_PER_OCTAVE;
  return niBaseHz * moriaToRatio(moria) * Math.pow(2, octaveShift);
}

/**
 * The number of cents between two adjacent degrees — used to lay out the
 * parallage ladder so spacing reflects the true microtonal intervals.
 */
export function moriaToCents(moria: number): number {
  return (moria / MORIA_PER_OCTAVE) * 1200;
}

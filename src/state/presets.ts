/**
 * Two kinds of "preset" the chanter cares about:
 *
 * 1. **Diapason references** — a fixed, well-known tuning standard for Νη.
 *    A=440 (Νη=C3=130.81 Hz) is modern equal-temperament, A=432 is the
 *    "old/natural" tuning some traditions use.
 *
 * 2. **Named presets** — user-saved snapshots of the full setup (mode, note,
 *    diapason, choir character) so a chanter can recall "Sunday Vespers Mode 4"
 *    in one tap.
 */

import type { Vowel } from "../audio/formants";

export interface DiapasonRef {
  id: string;
  label: string;
  /** Frequency of Νη (the parallage reference) in Hz. */
  niHz: number;
  hint: string;
}

/**
 * Νη Hz values are derived from the chosen A reference assuming Νη corresponds
 * to C3 (a common modern Greek chanting convention). niHz = A4 * 2^(-9/12) / 4.
 */
export const DIAPASON_REFS: DiapasonRef[] = [
  {
    id: "a440",
    label: "A=440",
    niHz: 130.81,
    hint: "Modern standard",
  },
  {
    id: "a432",
    label: "A=432",
    niHz: 128.43,
    hint: "Old / natural",
  },
  {
    id: "a415",
    label: "A=415",
    niHz: 123.47,
    hint: "Baroque pitch",
  },
];

export function diapasonRefById(id: string): DiapasonRef | undefined {
  return DIAPASON_REFS.find((d) => d.id === id);
}

/** Snapshot of every user-tunable setting that defines a saved preset. */
export interface NamedPreset {
  id: string;
  name: string;
  echosId: string;
  niBaseHz: number;
  octaveShift: number;
  activeDegree: number;
  vowel: Vowel;
  voiceCount: number;
  vibratoDepth: number;
  vibratoRate: number;
  breath: number;
  bass: number;
  reverbMix: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  glide: number;
  createdAt: number;
}

const PRESETS_KEY = "isokratima.presets.v1";

export function loadPresets(): NamedPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as NamedPreset[];
  } catch {
    return [];
  }
}

export function savePresets(presets: NamedPreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    /* storage unavailable — ignore */
  }
}

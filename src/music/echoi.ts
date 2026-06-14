/**
 * The Oktoechos — the eight modes (echoi) of Byzantine chant.
 *
 * Each echos specifies its genus (scale family), its base/tonic note (where the
 * ison most often rests) and the parallage degrees on which the ison is commonly
 * held as the melody moves. Bases vary between traditions and chant books; the
 * mapping below follows widely-taught modern Greek practice and is a sensible
 * default the chanter can override by simply tapping a different note.
 */

import type { ScaleFamily } from "./theory";

export interface Echos {
  id: string;
  /** English ordinal name, e.g. "First Mode". */
  ordinal: string;
  /** Greek name, e.g. "Ἦχος Πρῶτος". */
  greek: string;
  /** Short label for compact UI, e.g. "1st". */
  short: string;
  family: ScaleFamily;
  /** Parallage degree (0..7) the mode rests on — the primary ison. */
  tonicDegree: number;
  /** Degrees on which the ison is commonly held in this mode. */
  isonDegrees: number[];
  description: string;
}

export const ECHOI: Echos[] = [
  {
    id: "protos",
    ordinal: "First Mode",
    greek: "Ἦχος Πρῶτος",
    short: "1st",
    family: "diatonic",
    tonicDegree: 1, // Pa
    isonDegrees: [1, 4, 5], // Pa, Di, Ke
    description: "Diatonic, resting on Pa (D). Bright and majestic.",
  },
  {
    id: "devteros",
    ordinal: "Second Mode",
    greek: "Ἦχος Δεύτερος",
    short: "2nd",
    family: "softChromatic",
    tonicDegree: 4, // Di
    isonDegrees: [4, 6, 1], // Di, Zo, Pa
    description: "Soft chromatic, resting on Di (G). Sweet and tender.",
  },
  {
    id: "tritos",
    ordinal: "Third Mode",
    greek: "Ἦχος Τρίτος",
    short: "3rd",
    family: "enharmonic",
    tonicDegree: 3, // Ga
    isonDegrees: [3, 0, 4], // Ga, Ni, Di
    description: "Enharmonic, resting on Ga (F). Firm and steadfast.",
  },
  {
    id: "tetartos",
    ordinal: "Fourth Mode",
    greek: "Ἦχος Τέταρτος",
    short: "4th",
    family: "diatonic",
    tonicDegree: 4, // Di
    isonDegrees: [4, 1, 0], // Di, Pa, Ni
    description: "Diatonic, resting on Di (G) — also Pa for Legetos.",
  },
  {
    id: "plagal-protos",
    ordinal: "First Plagal",
    greek: "Ἦχος Πλάγιος Πρώτου",
    short: "Pl.1",
    family: "diatonic",
    tonicDegree: 1, // Pa
    isonDegrees: [1, 5, 4], // Pa, Ke, Di
    description: "Diatonic, resting on Pa (D) / Ke (A). Devotional.",
  },
  {
    id: "plagal-devteros",
    ordinal: "Second Plagal",
    greek: "Ἦχος Πλάγιος Δευτέρου",
    short: "Pl.2",
    family: "hardChromatic",
    tonicDegree: 1, // Pa
    isonDegrees: [1, 4, 0], // Pa, Di, Ni
    description: "Hard chromatic (Nenano), resting on Pa (D). Compunctionate.",
  },
  {
    id: "varys",
    ordinal: "Grave Mode",
    greek: "Ἦχος Βαρύς",
    short: "Var.",
    family: "enharmonic",
    tonicDegree: 6, // Zo
    isonDegrees: [6, 3, 0], // Zo, Ga, Ni
    description: "Enharmonic / diatonic, resting on Zo (B♭) or Ga (F). Grave.",
  },
  {
    id: "plagal-tetartos",
    ordinal: "Fourth Plagal",
    greek: "Ἦχος Πλάγιος Τετάρτου",
    short: "Pl.4",
    family: "diatonic",
    tonicDegree: 0, // Ni
    isonDegrees: [0, 4, 3], // Ni, Di, Ga
    description: "Diatonic, resting on Ni (C) / Di (G). Serene and resolved.",
  },
];

export function echosById(id: string): Echos {
  const found = ECHOI.find((e) => e.id === id);
  if (!found) throw new Error(`Unknown echos: ${id}`);
  return found;
}

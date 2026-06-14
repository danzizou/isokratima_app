import { describe, it, expect } from "vitest";
import {
  MORIA_PER_OCTAVE,
  SCALE_MORIA,
  PARALLAGE,
  moriaToRatio,
  noteFrequency,
  type ScaleFamily,
} from "../theory";
import { ECHOI, echosById } from "../echoi";

const FAMILIES = Object.keys(SCALE_MORIA) as ScaleFamily[];

describe("moria system", () => {
  it("has 72 moria per octave", () => {
    expect(MORIA_PER_OCTAVE).toBe(72);
  });

  it("converts moria to the correct frequency ratio", () => {
    expect(moriaToRatio(0)).toBeCloseTo(1);
    expect(moriaToRatio(72)).toBeCloseTo(2);
    expect(moriaToRatio(36)).toBeCloseTo(Math.SQRT2); // tritone-ish, half octave
  });
});

describe("scales", () => {
  it.each(FAMILIES)("scale '%s' closes the octave at 72 moria", (family) => {
    const scale = SCALE_MORIA[family];
    expect(scale).toHaveLength(8);
    expect(scale[0]).toBe(0);
    expect(scale[7]).toBe(72);
  });

  it.each(FAMILIES)("scale '%s' is strictly ascending", (family) => {
    const scale = SCALE_MORIA[family];
    for (let i = 1; i < scale.length; i++) {
      expect(scale[i]).toBeGreaterThan(scale[i - 1]);
    }
  });

  it.each(FAMILIES)("scale '%s' steps sum to 72", (family) => {
    const scale = SCALE_MORIA[family];
    const sum = scale.slice(1).reduce((acc, m, i) => acc + (m - scale[i]), 0);
    expect(sum).toBe(72);
  });
});

describe("parallage", () => {
  it("names the eight degrees Ni..Ni'", () => {
    expect(PARALLAGE.map((p) => p.name)).toEqual([
      "Ni",
      "Pa",
      "Vou",
      "Ga",
      "Di",
      "Ke",
      "Zo",
      "Ni'",
    ]);
  });

  it("indexes each degree consistently", () => {
    PARALLAGE.forEach((p, i) => expect(p.degree).toBe(i));
  });
});

describe("noteFrequency", () => {
  const NI = 130.81;

  it("places Ni at the diapason reference", () => {
    expect(noteFrequency("diatonic", 0, NI)).toBeCloseTo(NI);
  });

  it("places Ni' an octave above Ni", () => {
    expect(noteFrequency("diatonic", 7, NI)).toBeCloseTo(NI * 2);
  });

  it("transposes by whole octaves", () => {
    expect(noteFrequency("diatonic", 0, NI, 1)).toBeCloseTo(NI * 2);
    expect(noteFrequency("diatonic", 0, NI, -1)).toBeCloseTo(NI / 2);
  });

  it("orders pitches ascending within a scale", () => {
    let prev = 0;
    for (let d = 0; d < 8; d++) {
      const f = noteFrequency("softChromatic", d, NI);
      expect(f).toBeGreaterThan(prev);
      prev = f;
    }
  });
});

describe("echoi", () => {
  it("defines all eight modes", () => {
    expect(ECHOI).toHaveLength(8);
  });

  it("each mode has a valid family, tonic and ison set", () => {
    for (const e of ECHOI) {
      expect(SCALE_MORIA[e.family]).toBeDefined();
      expect(e.tonicDegree).toBeGreaterThanOrEqual(0);
      expect(e.tonicDegree).toBeLessThanOrEqual(7);
      expect(e.isonDegrees).toContain(e.tonicDegree);
      for (const d of e.isonDegrees) {
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(7);
      }
    }
  });

  it("looks up modes by id and rejects unknown ids", () => {
    expect(echosById("protos").ordinal).toBe("First Mode");
    expect(() => echosById("nope")).toThrow();
  });
});

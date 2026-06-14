/**
 * Application state — the single source of truth wiring the UI to the
 * {@link AudioEngine}. The engine is created once and lives for the app's
 * lifetime; the store mirrors its parameters so React can render them.
 */

import { create } from "zustand";
import { AudioEngine } from "../audio/AudioEngine";
import type { Vowel } from "../audio/formants";
import { echosById, ECHOI } from "../music/echoi";
import { noteFrequency } from "../music/theory";

const DEFAULT_NI_HZ = 130.81; // Ni ≈ C3 — a comfortable low ison register

const engine = new AudioEngine({
  voiceCount: 5,
  vowel: "oo",
  vibratoDepth: 14,
  vibratoRate: 5.4,
  breath: 0.04,
  spread: 18,
  reverbMix: 0.45,
  volume: 0.8,
});

export interface IsonState {
  echosId: string;
  niBaseHz: number;
  octaveShift: number;
  activeDegree: number;
  playing: boolean;
  vowel: Vowel;
  voiceCount: number;
  vibratoDepth: number;
  vibratoRate: number;
  breath: number;
  reverbMix: number;
  volume: number;

  currentFrequency: () => number;
  selectEchos: (id: string) => void;
  setActiveDegree: (degree: number) => void;
  togglePlay: () => void;
  setDiapason: (hz: number) => void;
  setOctaveShift: (shift: number) => void;
  setVowel: (vowel: Vowel) => void;
  setVoiceCount: (count: number) => void;
  setVibratoDepth: (cents: number) => void;
  setVibratoRate: (hz: number) => void;
  setBreath: (level: number) => void;
  setReverbMix: (mix: number) => void;
  setVolume: (volume: number) => void;
}

export const useIsonStore = create<IsonState>((set, get) => ({
  echosId: ECHOI[0].id,
  niBaseHz: DEFAULT_NI_HZ,
  octaveShift: 0,
  activeDegree: ECHOI[0].tonicDegree,
  playing: false,
  vowel: "oo",
  voiceCount: 5,
  vibratoDepth: 14,
  vibratoRate: 5.4,
  breath: 0.04,
  reverbMix: 0.45,
  volume: 0.8,

  currentFrequency: () => {
    const s = get();
    const { family } = echosById(s.echosId);
    return noteFrequency(family, s.activeDegree, s.niBaseHz, s.octaveShift);
  },

  selectEchos: (id) => {
    const echos = echosById(id);
    set({ echosId: id, activeDegree: echos.tonicDegree });
    const freq = get().currentFrequency();
    if (get().playing) engine.setPitch(freq);
  },

  setActiveDegree: (degree) => {
    set({ activeDegree: degree });
    const freq = get().currentFrequency();
    if (get().playing) engine.setPitch(freq);
  },

  togglePlay: () => {
    if (get().playing) {
      engine.stop();
      set({ playing: false });
    } else {
      void engine.play(get().currentFrequency());
      set({ playing: true });
    }
  },

  setDiapason: (hz) => {
    set({ niBaseHz: hz });
    if (get().playing) engine.setPitch(get().currentFrequency());
  },

  setOctaveShift: (shift) => {
    set({ octaveShift: shift });
    if (get().playing) engine.setPitch(get().currentFrequency());
  },

  setVowel: (vowel) => {
    set({ vowel });
    engine.setVowel(vowel);
  },

  setVoiceCount: (count) => {
    set({ voiceCount: count });
    engine.setVoiceCount(count);
  },

  setVibratoDepth: (cents) => {
    set({ vibratoDepth: cents });
    engine.setVibrato(cents, get().vibratoRate);
  },

  setVibratoRate: (hz) => {
    set({ vibratoRate: hz });
    engine.setVibrato(get().vibratoDepth, hz);
  },

  setBreath: (level) => {
    set({ breath: level });
    engine.setBreath(level);
  },

  setReverbMix: (mix) => {
    set({ reverbMix: mix });
    engine.setReverbMix(mix);
  },

  setVolume: (volume) => {
    set({ volume });
    engine.setVolume(volume);
  },
}));

/**
 * Application state — the single source of truth wiring the UI to the
 * {@link AudioEngine}. The engine is created once and lives for the app's
 * lifetime; the store mirrors its parameters so React can render them, and
 * persists them to localStorage between sessions.
 */

import { create } from "zustand";
import { AudioEngine } from "../audio/AudioEngine";
import type { Vowel } from "../audio/formants";
import { echosById, ECHOI } from "../music/echoi";
import { noteFrequency } from "../music/theory";
import { requestWakeLock, releaseWakeLock } from "../lib/wakeLock";
import {
  loadPresets,
  savePresets,
  type NamedPreset,
} from "./presets";

const DEFAULT_NI_HZ = 130.81; // Ni ≈ C3 — a comfortable low ison register
const PERSIST_KEY = "isokratima.settings.v1";

/** The user-tunable settings we remember between sessions. */
interface Persisted {
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
}

const DEFAULTS: Persisted = {
  echosId: ECHOI[0].id,
  niBaseHz: DEFAULT_NI_HZ,
  octaveShift: 0,
  activeDegree: ECHOI[0].tonicDegree,
  vowel: "oo",
  voiceCount: 4,
  vibratoDepth: 8,
  vibratoRate: 5.2,
  breath: 0,
  bass: 0.25,
  reverbMix: 0.35,
  volume: 0.8,
  fadeIn: 0.7,
  fadeOut: 0.6,
  glide: 0.15,
};

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return { ...DEFAULTS };
    const saved = JSON.parse(raw) as Partial<Persisted>;
    // Guard against a stale echos id from an older build.
    if (saved.echosId && !ECHOI.some((e) => e.id === saved.echosId)) {
      delete saved.echosId;
    }
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

const initial = loadPersisted();

const engine = new AudioEngine({
  voiceCount: initial.voiceCount,
  vowel: initial.vowel,
  vibratoDepth: initial.vibratoDepth,
  vibratoRate: initial.vibratoRate,
  breath: initial.breath,
  spread: 18,
  bass: initial.bass,
  reverbMix: initial.reverbMix,
  volume: initial.volume,
  fadeIn: initial.fadeIn,
  fadeOut: initial.fadeOut,
  glide: initial.glide,
});

export interface IsonState extends Persisted {
  playing: boolean;
  presets: NamedPreset[];

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
  setBass: (level: number) => void;
  setReverbMix: (mix: number) => void;
  setVolume: (volume: number) => void;
  setFadeIn: (s: number) => void;
  setFadeOut: (s: number) => void;
  setGlide: (s: number) => void;
  playReference: () => void;

  savePresetAs: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

export const useIsonStore = create<IsonState>((set, get) => ({
  ...initial,
  playing: false,
  presets: loadPresets(),

  currentFrequency: () => {
    const s = get();
    const { family } = echosById(s.echosId);
    return noteFrequency(family, s.activeDegree, s.niBaseHz, s.octaveShift);
  },

  selectEchos: (id) => {
    const echos = echosById(id);
    set({ echosId: id, activeDegree: echos.tonicDegree });
    if (get().playing) engine.setPitch(get().currentFrequency());
  },

  setActiveDegree: (degree) => {
    set({ activeDegree: degree });
    if (get().playing) engine.setPitch(get().currentFrequency());
  },

  togglePlay: () => {
    if (get().playing) {
      engine.stop();
      void releaseWakeLock();
      set({ playing: false });
    } else {
      void engine.play(get().currentFrequency());
      void requestWakeLock();
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

  setBass: (level) => {
    set({ bass: level });
    engine.setBass(level);
  },

  setReverbMix: (mix) => {
    set({ reverbMix: mix });
    engine.setReverbMix(mix);
  },

  setVolume: (volume) => {
    set({ volume });
    engine.setVolume(volume);
  },

  setFadeIn: (s) => {
    set({ fadeIn: s });
    const st = get();
    engine.setFade(s, st.fadeOut, st.glide);
  },

  setFadeOut: (s) => {
    set({ fadeOut: s });
    const st = get();
    engine.setFade(st.fadeIn, s, st.glide);
  },

  setGlide: (s) => {
    set({ glide: s });
    const st = get();
    engine.setFade(st.fadeIn, st.fadeOut, s);
  },

  playReference: () => {
    engine.playReference(get().currentFrequency(), 2);
  },

  savePresetAs: (name) => {
    const s = get();
    const preset: NamedPreset = {
      id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || "Untitled",
      echosId: s.echosId,
      niBaseHz: s.niBaseHz,
      octaveShift: s.octaveShift,
      activeDegree: s.activeDegree,
      vowel: s.vowel,
      voiceCount: s.voiceCount,
      vibratoDepth: s.vibratoDepth,
      vibratoRate: s.vibratoRate,
      breath: s.breath,
      bass: s.bass,
      reverbMix: s.reverbMix,
      volume: s.volume,
      fadeIn: s.fadeIn,
      fadeOut: s.fadeOut,
      glide: s.glide,
      createdAt: Date.now(),
    };
    const presets = [...s.presets, preset];
    set({ presets });
    savePresets(presets);
  },

  loadPreset: (id) => {
    const p = get().presets.find((x) => x.id === id);
    if (!p) return;
    set({
      echosId: p.echosId,
      niBaseHz: p.niBaseHz,
      octaveShift: p.octaveShift,
      activeDegree: p.activeDegree,
      vowel: p.vowel,
      voiceCount: p.voiceCount,
      vibratoDepth: p.vibratoDepth,
      vibratoRate: p.vibratoRate,
      breath: p.breath,
      bass: p.bass,
      reverbMix: p.reverbMix,
      volume: p.volume,
      fadeIn: p.fadeIn,
      fadeOut: p.fadeOut,
      glide: p.glide,
    });
    // Push the loaded values into the live engine.
    engine.setVowel(p.vowel);
    engine.setVoiceCount(p.voiceCount);
    engine.setVibrato(p.vibratoDepth, p.vibratoRate);
    engine.setBreath(p.breath);
    engine.setBass(p.bass);
    engine.setReverbMix(p.reverbMix);
    engine.setVolume(p.volume);
    engine.setFade(p.fadeIn, p.fadeOut, p.glide);
    if (get().playing) engine.setPitch(get().currentFrequency());
  },

  deletePreset: (id) => {
    const presets = get().presets.filter((p) => p.id !== id);
    set({ presets });
    savePresets(presets);
  },
}));

// Persist the tunable settings whenever they change (the engine already holds
// the live values; this just remembers them for next time).
useIsonStore.subscribe((s) => {
  const toSave: Persisted = {
    echosId: s.echosId,
    niBaseHz: s.niBaseHz,
    octaveShift: s.octaveShift,
    activeDegree: s.activeDegree,
    vowel: s.vowel,
    voiceCount: s.voiceCount,
    vibratoDepth: s.vibratoDepth,
    vibratoRate: s.vibratoRate,
    breath: s.breath,
    bass: s.bass,
    reverbMix: s.reverbMix,
    volume: s.volume,
    fadeIn: s.fadeIn,
    fadeOut: s.fadeOut,
    glide: s.glide,
  };
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(toSave));
  } catch {
    /* storage may be unavailable (private mode) — ignore */
  }
});

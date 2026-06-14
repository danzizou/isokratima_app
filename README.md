# Ἰσοκράτημα — Isokratima

A professional **isokratima (ison)** app for Byzantine church chant. It holds the
sustained vocal drone beneath the melody, synthesising a **choir of ison-singers**
rather than a flat synth tone — many slightly-detuned voices with vibrato, breath,
stereo spread and a warm church reverb.

It honours the **full Byzantine system**: the parallage (Νη Πα Βου Γα Δι Κε Ζω Νη'),
the eight echoi of the Oktoechos across all four genera (diatonic, soft chromatic,
hard chromatic, enharmonic), with true **microtonal moria** intervals (72 moria per
octave) rather than Western equal temperament. The ison glides smoothly to its new
resting note when you move it, the way real isokratai do.

It is a Progressive Web App: installable to a phone/tablet/desktop home screen and
fully usable offline (the sound is synthesised, so there are no audio downloads).

## Features

- **Choir ison** — synthesised vocal drone (1–8 voices) using a warm glottal
  waveform and formant-shaped vowels (Α/ah, Ο/oh, Ου/oo, Ε/eh, Ι/ee, Μ/hum), with
  per-voice vibrato, slow drift, amplitude shimmer and breath.
- **Humanised ensemble** — singers enter with staggered, randomised onsets and
  drift independently, so the choir gathers and breathes rather than snapping on.
- **Bass foundation** — an optional sustained voice an octave below for weight.
- **Eight echoi** — tap a mode; the parallage ladder and resting note update.
- **Microtonal ladder** — notes are spaced by their true moria intervals; tap any
  note to rest or move the ison there, with a seamless glide.
- **Tuning** — adjustable diapason (the Νη reference, in Hz) and Low/Mid/High register.
- **Church reverb** — procedurally-generated cathedral acoustic, adjustable wet level.
- **Smooth swell** — the drone breathes in and out; a limiter keeps the mix clean.
- **Remembers your setup** — all settings persist between sessions.
- **Stays awake** — a screen wake-lock keeps the device from sleeping while sounding.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
npm run test     # run the music-theory unit tests
```

Open the dev URL in a browser. The first tap on **Hold ison** unlocks audio
(browsers require a user gesture before sound can start).

## Manual audio verification

1. Press **Hold ison** — a warm, choir-like sustained drone swells in.
2. Tap different notes on the ladder — the choir should **glide** smoothly to the
   new pitch with no clicks.
3. Switch echoi — the resting note (◆) and available pitches change; chromatic
   modes sound audibly different from diatonic ones.
4. Open **Settings** (gear): change vowel, voices, vibrato, breath, reverb,
   diapason and register, and confirm each audibly affects the sound.

> Synthesised voices sound convincingly choir-*like*; they are not a recording of
> a real choir. The audio engine (`src/audio/`) is structured so recorded ison
> samples could be substituted later for maximum realism.

## Project structure

```
src/
  audio/      AudioEngine, ChoirDrone, IsonVoice, reverb, formants  (Web Audio)
  music/      theory (moria system) + echoi (the Oktoechos)
  components/ React UI (note display, parallage ladder, selectors, controls)
  state/      Zustand store wiring the UI to the engine
```

## Theory notes

Pitches use the 72-moria octave: an interval of *m* moria is the ratio `2^(m/72)`.
The genera are encoded as absolute moria positions of the eight parallage degrees
(see `src/music/theory.ts`). Mode bases follow widely-taught modern Greek practice
and can be overridden simply by tapping a different note.

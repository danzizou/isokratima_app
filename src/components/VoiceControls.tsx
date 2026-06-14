import { useIsonStore } from "../state/useIsonStore";
import { Slider } from "./Slider";
import { VOWEL_LABELS, type Vowel } from "../audio/formants";

const VOWELS = Object.keys(VOWEL_LABELS) as Vowel[];

/** Choir character: voices, vowel, vibrato, breath, reverb and volume. */
export function VoiceControls() {
  const s = useIsonStore();

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 text-xs text-gold-500">Vowel</div>
        <div className="grid grid-cols-3 gap-1.5">
          {VOWELS.map((v) => (
            <button
              key={v}
              onClick={() => s.setVowel(v)}
              className={`rounded-md border px-1 py-1.5 text-xs transition-colors ${
                s.vowel === v
                  ? "border-gold-400 bg-gold-500/20 text-gold-300"
                  : "border-wax-600 bg-wax-800/60 text-gold-600 hover:border-gold-600"
              }`}
            >
              {VOWEL_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      <Slider
        label="Voices"
        value={s.voiceCount}
        min={1}
        max={8}
        step={1}
        onChange={s.setVoiceCount}
        format={(v) => `${v}`}
      />
      <Slider
        label="Vibrato depth"
        value={s.vibratoDepth}
        min={0}
        max={30}
        step={1}
        onChange={s.setVibratoDepth}
        format={(v) => `${v}¢`}
      />
      <Slider
        label="Vibrato rate"
        value={s.vibratoRate}
        min={3}
        max={7}
        step={0.1}
        onChange={s.setVibratoRate}
        format={(v) => `${v.toFixed(1)} Hz`}
      />
      <Slider
        label="Breath"
        value={s.breath}
        min={0}
        max={0.2}
        step={0.005}
        onChange={s.setBreath}
        format={(v) => `${Math.round((v / 0.2) * 100)}%`}
      />
      <Slider
        label="Church reverb"
        value={s.reverbMix}
        min={0}
        max={1}
        step={0.01}
        onChange={s.setReverbMix}
        format={(v) => `${Math.round(v * 100)}%`}
      />
      <Slider
        label="Volume"
        value={s.volume}
        min={0}
        max={1}
        step={0.01}
        onChange={s.setVolume}
        format={(v) => `${Math.round(v * 100)}%`}
      />
    </div>
  );
}

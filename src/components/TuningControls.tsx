import { useIsonStore } from "../state/useIsonStore";
import { Slider } from "./Slider";

/** Diapason (tuning reference) and octave transposition. */
export function TuningControls() {
  const {
    niBaseHz,
    setDiapason,
    octaveShift,
    setOctaveShift,
  } = useIsonStore();

  return (
    <div className="space-y-3">
      <Slider
        label="Diapason (Νη reference)"
        value={niBaseHz}
        min={98}
        max={196}
        step={0.5}
        onChange={setDiapason}
        format={(v) => `${v.toFixed(1)} Hz`}
      />
      <div>
        <div className="mb-1 text-xs text-gold-500">Register (octave)</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { v: -1, label: "Low" },
            { v: 0, label: "Mid" },
            { v: 1, label: "High" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setOctaveShift(o.v)}
              className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                octaveShift === o.v
                  ? "border-gold-400 bg-gold-500/20 text-gold-300"
                  : "border-wax-600 bg-wax-800/60 text-gold-600 hover:border-gold-600"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

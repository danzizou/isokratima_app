import { useState } from "react";
import { useIsonStore } from "../state/useIsonStore";
import { echosById } from "../music/echoi";
import { noteAt } from "../music/theory";

/**
 * Named-preset management: a list of the user's saved configurations and a
 * compact "save current" inline form. A preset captures the mode, current note,
 * tuning and the full choir/mix character so a chanter can recall, say, "Sunday
 * Vespers Mode 4" with one tap.
 */
export function PresetManager() {
  const { presets, savePresetAs, loadPreset, deletePreset } = useIsonStore();
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    savePresetAs(name);
    setName("");
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          placeholder="Preset name (e.g. Vespers Mode 4)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-wax-600 bg-wax-900/60 px-3 py-2 text-sm text-gold-300 placeholder:text-gold-600/60 focus:border-gold-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-md border border-gold-600 bg-wax-800 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold-300 transition-colors hover:border-gold-400 disabled:opacity-40"
        >
          Save
        </button>
      </form>

      {presets.length === 0 ? (
        <p className="rounded-md border border-dashed border-wax-600 px-3 py-3 text-center text-xs italic text-gold-600/70">
          No saved presets yet. Configure the app, then save.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {presets.map((p) => {
            const e = echosById(p.echosId);
            const n = noteAt(p.activeDegree);
            return (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-md border border-wax-700 bg-wax-900/40 px-2 py-2"
              >
                <button
                  onClick={() => loadPreset(p.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="font-serif text-xl text-gold-300">
                    {n.greek}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-gold-300">
                      {p.name}
                    </div>
                    <div className="truncate text-[10px] uppercase tracking-wider text-gold-600">
                      {e.ordinal} · Νη {p.niBaseHz.toFixed(1)} Hz
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => deletePreset(p.id)}
                  aria-label={`Delete preset ${p.name}`}
                  className="rounded-md border border-wax-600 px-2 py-1 text-xs text-gold-600 hover:border-icon-red hover:text-icon-red"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

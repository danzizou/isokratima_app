import { useIsonStore } from "../state/useIsonStore";
import { PARALLAGE, SCALE_MORIA, MORIA_PER_OCTAVE } from "../music/theory";
import { echosById } from "../music/echoi";

/**
 * The parallage ladder: the mode's notes laid out vertically with spacing that
 * reflects the true microtonal (moria) intervals. Tap a note to rest — or move
 * — the ison there; the choir glides to it.
 */
export function ParallageLadder() {
  const { echosId, activeDegree, setActiveDegree } = useIsonStore();
  const echos = echosById(echosId);
  const moria = SCALE_MORIA[echos.family];
  const isonSet = new Set(echos.isonDegrees);

  return (
    <div className="relative mx-auto h-[360px] w-full max-w-xs">
      {/* spine */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gold-600/30" />
      {PARALLAGE.map((note, degree) => {
        const pct = (moria[degree] / MORIA_PER_OCTAVE) * 100;
        const active = degree === activeDegree;
        const isTonic = degree === echos.tonicDegree;
        const isIson = isonSet.has(degree);
        return (
          <button
            key={note.name}
            onClick={() => setActiveDegree(degree)}
            style={{ bottom: `${pct}%` }}
            className={`group absolute left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center gap-3 rounded-full border px-4 py-1.5 transition-all ${
              active
                ? "border-gold-400 bg-gold-500/20 text-gold-300 shadow-[0_0_16px_rgba(217,184,118,0.45)] scale-110"
                : isIson
                  ? "border-gold-600/60 bg-wax-700/70 text-gold-400 hover:border-gold-400"
                  : "border-wax-600 bg-wax-800/70 text-gold-600 hover:border-gold-600"
            }`}
          >
            <span className="font-serif text-xl leading-none">{note.greek}</span>
            <span className="text-xs uppercase tracking-wider">{note.name}</span>
            {isTonic && (
              <span className="text-[10px] font-semibold text-icon-red">
                ◆
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

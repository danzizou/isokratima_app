import { useIsonStore } from "../state/useIsonStore";
import { PARALLAGE } from "../music/theory";
import { echosById } from "../music/echoi";

/**
 * The parallage as a 2×4 grid of large, tap-friendly buttons — the layout used
 * by Psaltikon Tonarion and similar Byzantine ison apps. Big rectangles read
 * better at a distance and at arm's length than a microtonally-spaced ladder.
 *
 * The mode's tonic gets a small ◆ marker; the mode's other commonly-held ison
 * notes get a subtle gold tint. Tap a note to move the ison to it.
 */
export function ParallageGrid() {
  const { echosId, activeDegree, setActiveDegree } = useIsonStore();
  const echos = echosById(echosId);
  const isonSet = new Set(echos.isonDegrees);

  return (
    <div className="grid grid-cols-4 gap-2">
      {PARALLAGE.map((note, degree) => {
        const active = degree === activeDegree;
        const isTonic = degree === echos.tonicDegree;
        const isIson = isonSet.has(degree);
        return (
          <button
            key={note.name}
            onClick={() => setActiveDegree(degree)}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 py-3 transition-all ${
              active
                ? "border-gold-400 bg-gold-500/25 text-gold-200 shadow-[0_0_18px_rgba(217,184,118,0.45)] scale-[1.02]"
                : isIson
                  ? "border-gold-600/70 bg-wax-700/60 text-gold-300 hover:border-gold-400"
                  : "border-wax-600 bg-wax-800/60 text-gold-500 hover:border-gold-600"
            }`}
          >
            {isTonic && (
              <span className="absolute right-1.5 top-1 text-[10px] text-icon-red">
                ◆
              </span>
            )}
            <span className="font-serif text-3xl leading-none">{note.greek}</span>
            <span className="mt-1 text-[10px] uppercase tracking-widest opacity-80">
              {note.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

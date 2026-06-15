import { useIsonStore } from "../state/useIsonStore";
import { PARALLAGE } from "../music/theory";
import { echosById } from "../music/echoi";

/**
 * The mode's commonly-held ison notes as a row of large tap targets, for the
 * "moving ison" pattern: a chanter switches between two or three of these as
 * the melody cadences. Faster than scanning the full 8-note grid mid-chant.
 */
export function QuickIson() {
  const { echosId, activeDegree, setActiveDegree } = useIsonStore();
  const echos = echosById(echosId);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold-600">
        Moving ison
      </div>
      <div className="flex gap-2">
        {echos.isonDegrees.map((degree) => {
          const note = PARALLAGE[degree];
          const active = degree === activeDegree;
          const isTonic = degree === echos.tonicDegree;
          return (
            <button
              key={degree}
              onClick={() => setActiveDegree(degree)}
              className={`relative flex-1 rounded-lg border-2 py-2 transition-all ${
                active
                  ? "border-gold-400 bg-gold-500/25 text-gold-200 shadow-[0_0_14px_rgba(217,184,118,0.4)]"
                  : "border-gold-600/60 bg-wax-800/70 text-gold-400 hover:border-gold-400"
              }`}
            >
              {isTonic && (
                <span className="absolute right-1.5 top-1 text-[9px] text-icon-red">
                  ◆
                </span>
              )}
              <div className="font-serif text-2xl leading-none">
                {note.greek}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-75">
                {note.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

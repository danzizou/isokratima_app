import { useIsonStore } from "../state/useIsonStore";
import { noteAt } from "../music/theory";
import { echosById } from "../music/echoi";

/**
 * The parallage as a 4×4 grid: the main 8 notes (Νη..Νη') plus the four notes
 * immediately above and below, giving the chanter a 2-octave practical range.
 *
 *   Πα'  Βου' Γα'  Δι'    ← next octave (offset +1)
 *   Δι   Κε   Ζω   Νη'    ← main, upper half
 *   Νη   Πα   Βου  Γα     ← main, lower half
 *   Γα,  Δι,  Κε,  Ζω,    ← previous octave (offset −1)
 *
 * Extended-octave cells are visually dimmer with a small ↑/↓ marker so the
 * "current" Byzantine octave reads at a glance.
 */

const ROWS: number[][] = [
  [8, 9, 10, 11],
  [4, 5, 6, 7],
  [0, 1, 2, 3],
  [-4, -3, -2, -1],
];

export function ParallageGrid() {
  const { echosId, activeDegree, setActiveDegree } = useIsonStore();
  const echos = echosById(echosId);
  const isonSet = new Set(echos.isonDegrees);

  return (
    <div className="grid grid-cols-4 gap-2">
      {ROWS.flat().map((degree) => {
        const note = noteAt(degree);
        const active = degree === activeDegree;
        const isTonic = note.isMain && degree === echos.tonicDegree;
        const isIson = note.isMain && isonSet.has(degree);
        return (
          <button
            key={degree}
            onClick={() => setActiveDegree(degree)}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 py-2.5 transition-all ${
              active
                ? "border-gold-400 bg-gold-500/25 text-gold-200 shadow-[0_0_18px_rgba(217,184,118,0.45)] scale-[1.02]"
                : note.isMain
                  ? isIson
                    ? "border-gold-600/70 bg-wax-700/60 text-gold-300 hover:border-gold-400"
                    : "border-wax-600 bg-wax-800/60 text-gold-500 hover:border-gold-600"
                  : "border-wax-700 bg-wax-900/50 text-gold-600/80 hover:border-wax-600 hover:text-gold-500"
            }`}
          >
            {isTonic && (
              <span className="absolute right-1.5 top-1 text-[10px] text-icon-red">
                ◆
              </span>
            )}
            {!note.isMain && (
              <span
                className="absolute left-1.5 top-0.5 text-[9px] font-bold text-gold-600/70"
                aria-hidden
              >
                {note.octaveOffset > 0 ? "↑" : "↓"}
              </span>
            )}
            <span
              className={`font-serif leading-none ${
                note.isMain ? "text-[1.75rem]" : "text-2xl"
              }`}
            >
              {note.greek}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-widest opacity-80">
              {note.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

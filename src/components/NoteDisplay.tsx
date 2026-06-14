import { useIsonStore } from "../state/useIsonStore";
import { PARALLAGE } from "../music/theory";
import { echosById } from "../music/echoi";

/** Shows the note the ison currently rests on, with a breathing glow. */
export function NoteDisplay() {
  const { echosId, activeDegree, playing } = useIsonStore();
  const freq = useIsonStore((s) => s.currentFrequency());
  const note = PARALLAGE[activeDegree];
  const echos = echosById(echosId);

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Breathing halo while sounding */}
      <div
        className={`pointer-events-none absolute h-44 w-44 rounded-full bg-gold-500/20 blur-2xl ${
          playing ? "animate-breathe" : "opacity-0"
        }`}
      />
      <div className="relative flex flex-col items-center">
        <span className="font-serif text-7xl leading-none text-gold-300 drop-shadow">
          {note.greek}
        </span>
        <span className="mt-2 text-lg tracking-widest text-gold-500 uppercase">
          {note.name} · {note.western}
        </span>
        <span className="mt-1 text-sm text-gold-600">
          {freq.toFixed(1)} Hz
        </span>
        <span className="mt-3 text-xs italic text-gold-600/80">
          {echos.greek}
        </span>
      </div>
    </div>
  );
}

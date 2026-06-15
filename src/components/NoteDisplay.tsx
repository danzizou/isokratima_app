import { useIsonStore } from "../state/useIsonStore";
import { noteAt } from "../music/theory";

/**
 * The focal point: the note the ison currently rests on, big and clear, with a
 * gentle "breathing" halo while the choir is sounding. Handles extended-range
 * notes (with a small ↑/↓ marker for octaves outside the main scale).
 */
export function NoteDisplay() {
  const { activeDegree, playing } = useIsonStore();
  const freq = useIsonStore((s) => s.currentFrequency());
  const note = noteAt(activeDegree);

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      <div
        className={`pointer-events-none absolute h-40 w-40 rounded-full bg-gold-500/25 blur-3xl transition-opacity ${
          playing ? "animate-breathe opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <span className="font-serif text-[5.5rem] leading-none text-gold-200 drop-shadow-md">
            {note.greek}
          </span>
          {!note.isMain && (
            <span
              className="absolute -right-6 top-1 text-lg text-gold-500"
              aria-hidden
            >
              {note.octaveOffset > 0 ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-baseline gap-3 text-gold-500">
          <span className="text-base uppercase tracking-[0.25em]">
            {note.name}
          </span>
          <span className="text-sm opacity-70">{note.western}</span>
        </div>
        <span className="mt-2 font-mono text-xs text-gold-600">
          {freq.toFixed(1)} Hz
        </span>
      </div>
    </div>
  );
}

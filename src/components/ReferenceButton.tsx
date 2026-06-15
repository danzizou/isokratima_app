import { useState } from "react";
import { useIsonStore } from "../state/useIsonStore";

/**
 * Plays a clean ~2 second pure-sine tone at the currently-selected note — a
 * pitch reference for the chanter to warm up, match, or check against. Works
 * whether the choir ison is sounding or not (it doesn't interrupt it).
 */
export function ReferenceButton() {
  const playReference = useIsonStore((s) => s.playReference);
  const [lit, setLit] = useState(false);

  const trigger = () => {
    playReference();
    setLit(true);
    window.setTimeout(() => setLit(false), 2000);
  };

  return (
    <button
      onClick={trigger}
      aria-label="Play pitch reference"
      className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 transition-all ${
        lit
          ? "border-gold-300 bg-gold-500/20 text-gold-200 shadow-[0_0_18px_rgba(217,184,118,0.6)]"
          : "border-gold-600 bg-wax-800 text-gold-500 hover:border-gold-400 hover:text-gold-300"
      }`}
    >
      <span className="font-serif text-xl leading-none">♪</span>
      <span className="mt-0.5 text-[9px] uppercase tracking-widest">tune</span>
    </button>
  );
}

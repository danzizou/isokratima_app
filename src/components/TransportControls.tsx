import { useIsonStore } from "../state/useIsonStore";

/** The large play / stop control that swells the drone in and out. */
export function TransportControls() {
  const { playing, togglePlay } = useIsonStore();

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={togglePlay}
        aria-label={playing ? "Stop ison" : "Start ison"}
        className={`flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all ${
          playing
            ? "border-gold-400 bg-gold-500/20 shadow-[0_0_28px_rgba(217,184,118,0.5)]"
            : "border-gold-600 bg-wax-800 hover:border-gold-400 hover:bg-wax-700"
        }`}
      >
        {playing ? (
          <span className="h-6 w-6 rounded-sm bg-gold-300" />
        ) : (
          <span className="ml-1 h-0 w-0 border-y-[14px] border-l-[22px] border-y-transparent border-l-gold-300" />
        )}
      </button>
      <span className="text-xs uppercase tracking-widest text-gold-600">
        {playing ? "Holding" : "Hold ison"}
      </span>
    </div>
  );
}

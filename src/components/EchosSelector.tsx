import { useIsonStore } from "../state/useIsonStore";
import { ECHOI, echosById } from "../music/echoi";
import { SCALE_FAMILY_LABEL } from "../music/theory";

/** Choose among the eight echoi of the Oktoechos. */
export function EchosSelector() {
  const { echosId, selectEchos } = useIsonStore();
  const current = echosById(echosId);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-1.5">
        {ECHOI.map((e) => (
          <button
            key={e.id}
            onClick={() => selectEchos(e.id)}
            className={`rounded-md border px-1 py-2 text-xs font-medium transition-colors ${
              e.id === echosId
                ? "border-gold-400 bg-gold-500/20 text-gold-300"
                : "border-wax-600 bg-wax-800/60 text-gold-600 hover:border-gold-600"
            }`}
          >
            {e.short}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-gold-600/80">
        <span className="text-gold-400">{current.ordinal}</span>
        {" · "}
        {SCALE_FAMILY_LABEL[current.family]}
      </p>
      <p className="mt-0.5 text-center text-[11px] italic text-gold-600/60">
        {current.description}
      </p>
    </div>
  );
}

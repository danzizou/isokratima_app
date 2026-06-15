import { useIsonStore } from "../state/useIsonStore";
import { ECHOI, echosById } from "../music/echoi";
import { SCALE_FAMILY_LABEL } from "../music/theory";

/**
 * The eight echoi of the Oktoechos shown as a 4×2 tab grid — the prominent
 * mode-picker found in Tonarion / WorldScale-style apps. A caption below the
 * grid names the current mode and its genus.
 */
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
            className={`rounded-lg border px-1 py-2 text-sm font-semibold transition-colors ${
              e.id === echosId
                ? "border-gold-400 bg-gold-500/25 text-gold-200"
                : "border-wax-600 bg-wax-800/60 text-gold-500 hover:border-gold-600"
            }`}
          >
            {e.short}
          </button>
        ))}
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-gold-300">
          {current.ordinal}
          <span className="ml-2 text-xs font-normal text-gold-600">
            · {SCALE_FAMILY_LABEL[current.family]}
          </span>
        </div>
      </div>
    </div>
  );
}

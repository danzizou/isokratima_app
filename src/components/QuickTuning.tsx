import { useIsonStore } from "../state/useIsonStore";
import { DIAPASON_REFS } from "../state/presets";

/**
 * A small, always-visible tuning strip: nudge the diapason (Νη reference) by
 * ±0.5 Hz, jump the register down/up an octave, and see the live Νη value at
 * the centre. Tap-and-hold is intentionally not used so a chanter can fine-tune
 * one Hz at a time.
 */
export function QuickTuning() {
  const { niBaseHz, setDiapason, octaveShift, setOctaveShift } = useIsonStore();
  // Match a preset when the diapason is within 0.05 Hz of its reference.
  const activeRef = DIAPASON_REFS.find((r) => Math.abs(r.niHz - niBaseHz) < 0.05);

  return (
    <div className="rounded-xl border border-wax-600 bg-wax-800/60 px-2 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <TuneButton onClick={() => setOctaveShift(Math.max(-1, octaveShift - 1))}>
            8va▼
          </TuneButton>
          <span className="w-8 text-center text-xs uppercase text-gold-500">
            {["Low", "Mid", "High"][octaveShift + 1]}
          </span>
          <TuneButton onClick={() => setOctaveShift(Math.min(1, octaveShift + 1))}>
            8va▲
          </TuneButton>
        </div>

        <div className="flex items-center gap-1.5">
          <TuneButton onClick={() => setDiapason(Math.max(98, niBaseHz - 0.5))}>
            −
          </TuneButton>
          <div className="min-w-[110px] text-center">
            <div className="text-[10px] uppercase tracking-widest text-gold-600">
              Νη
            </div>
            <div className="font-mono text-sm text-gold-300">
              {niBaseHz.toFixed(1)} Hz
            </div>
          </div>
          <TuneButton onClick={() => setDiapason(Math.min(196, niBaseHz + 0.5))}>
            +
          </TuneButton>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 border-t border-wax-700 pt-2">
        <span className="text-[10px] uppercase tracking-widest text-gold-600">
          Ref
        </span>
        {DIAPASON_REFS.map((r) => (
          <button
            key={r.id}
            onClick={() => setDiapason(r.niHz)}
            title={r.hint}
            className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
              activeRef?.id === r.id
                ? "border-gold-400 bg-gold-500/20 text-gold-200"
                : "border-wax-600 bg-wax-900/60 text-gold-500 hover:border-gold-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TuneButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-wax-600 bg-wax-900/60 px-2.5 py-1.5 text-xs font-semibold text-gold-400 transition-colors hover:border-gold-600 hover:text-gold-300"
    >
      {children}
    </button>
  );
}

import { useEffect } from "react";
import { VoiceControls } from "./VoiceControls";
import { PresetManager } from "./PresetManager";

/**
 * A slide-up bottom sheet for the advanced choir / mix settings. Keeps the main
 * surface focused on the chanter's task (mode → note → play) while the more
 * detailed sliders are one tap away.
 */
export function SettingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Sheet */}
      <aside
        role="dialog"
        aria-label="Settings"
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md transform rounded-t-2xl border border-b-0 border-wax-600 bg-wax-900/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl backdrop-blur transition-transform ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-wax-600" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-md border border-wax-600 px-2.5 py-1 text-xs text-gold-400 hover:border-gold-600"
          >
            Done
          </button>
        </div>
        <div className="max-h-[65vh] space-y-6 overflow-y-auto pb-2">
          <section>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.25em] text-gold-500">
              Presets
            </h3>
            <PresetManager />
          </section>
          <section>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.25em] text-gold-500">
              Choir &amp; Mix
            </h3>
            <VoiceControls />
          </section>
        </div>
      </aside>
    </>
  );
}

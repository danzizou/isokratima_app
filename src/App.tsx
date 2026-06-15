import { useState } from "react";
import { NoteDisplay } from "./components/NoteDisplay";
import { ParallageGrid } from "./components/ParallageGrid";
import { EchosSelector } from "./components/EchosSelector";
import { TransportControls } from "./components/TransportControls";
import { QuickTuning } from "./components/QuickTuning";
import { SettingsSheet } from "./components/SettingsSheet";

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl tracking-wide text-gold-300">
            Ἰσοκράτημα
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold-600">
            Byzantine Ison
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className="rounded-full border border-wax-600 p-2 text-gold-500 hover:border-gold-600"
        >
          <GearIcon />
        </button>
      </header>

      <EchosSelector />

      <NoteDisplay />

      <ParallageGrid />

      <div className="mt-2 flex justify-center">
        <TransportControls />
      </div>

      <div className="mt-auto pt-2">
        <QuickTuning />
        <p className="mt-2 text-center text-[10px] text-gold-600/50">
          Tap a note to move the ison · ◆ marks the mode's resting note
        </p>
      </div>

      <SettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

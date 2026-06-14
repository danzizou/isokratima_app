import { useState } from "react";
import { NoteDisplay } from "./components/NoteDisplay";
import { ParallageLadder } from "./components/ParallageLadder";
import { EchosSelector } from "./components/EchosSelector";
import { TransportControls } from "./components/TransportControls";
import { TuningControls } from "./components/TuningControls";
import { VoiceControls } from "./components/VoiceControls";

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-wide text-gold-300">
            Ἰσοκράτημα
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-600">
            Byzantine Ison
          </p>
        </div>
        <button
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Settings"
          className={`rounded-full border p-2 transition-colors ${
            showSettings
              ? "border-gold-400 text-gold-300"
              : "border-wax-600 text-gold-600 hover:border-gold-600"
          }`}
        >
          <GearIcon />
        </button>
      </header>

      {showSettings ? (
        <section className="mt-6 space-y-6">
          <Panel title="Tuning">
            <TuningControls />
          </Panel>
          <Panel title="Choir">
            <VoiceControls />
          </Panel>
        </section>
      ) : (
        <>
          <NoteDisplay />

          <div className="mt-2 flex items-stretch gap-2">
            <div className="flex-1">
              <ParallageLadder />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <TransportControls />
          </div>

          <div className="mt-8">
            <EchosSelector />
          </div>
        </>
      )}

      <footer className="mt-auto pt-8 text-center text-[10px] text-gold-600/50">
        Tap a note to move the ison · ◆ marks the mode's resting note
      </footer>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-wax-600 bg-wax-800/40 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold-500">
        {title}
      </h2>
      {children}
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

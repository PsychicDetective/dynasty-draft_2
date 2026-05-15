"use client";
// Floating control bar shown only when leagueId === "mock".
// Lets you advance picks directly from the draft room without switching tabs.

import { useState } from "react";
import { useDraftStore } from "@/lib/store";
import { clsx } from "clsx";

export function SimulatorBar() {
  const draft = useDraftStore(s => s.draft);
  const [loading, setLoading] = useState(false);

  const done = draft?.allPicks.filter(p => p.status === "complete").length ?? 0;
  const total = (draft?.totalRounds ?? 5) * (draft?.totalTeams ?? 6);

  async function advance(n = 1) {
    setLoading(true);
    try {
      for (let i = 0; i < n; i++) {
        await fetch("/api/sleeper/mock", { method: "POST" });
        // Small gap so rapid advances don't blur together in the UI
        if (i < n - 1) await new Promise(r => setTimeout(r, 150));
      }
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setLoading(true);
    try {
      await fetch("/api/sleeper/mock", { method: "DELETE" });
    } finally {
      setLoading(false);
    }
  }

  const isComplete = done >= total;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-pitch-surface border border-border rounded-full px-3 py-1.5 shadow-xl">
      {/* Label */}
      <span className="text-[9px] font-display font-black tracking-[.15em] text-gray-600 uppercase pr-1">
        Sim
      </span>

      {/* Progress */}
      <span className="font-mono text-[11px] text-gray-500 tabular-nums w-12 text-center">
        {done}/{total}
      </span>

      {/* Advance 1 */}
      <button
        onClick={() => advance(1)}
        disabled={loading || isComplete}
        className={clsx(
          "font-display font-black text-[11px] tracking-wider px-3 py-1 rounded-full transition-colors",
          isComplete
            ? "text-gray-700 cursor-default"
            : "bg-gold text-black hover:bg-gold/80 disabled:opacity-50"
        )}
      >
        {loading ? "…" : isComplete ? "Done" : "Next pick ▶"}
      </button>

      {/* +5 */}
      {!isComplete && (
        <button
          onClick={() => advance(5)}
          disabled={loading}
          className="font-display font-black text-[10px] tracking-wider px-2.5 py-1 rounded-full border border-border text-gray-400 hover:text-white hover:border-border-strong transition-colors disabled:opacity-40"
        >
          +5
        </button>
      )}

      {/* Reset */}
      <button
        onClick={reset}
        disabled={loading}
        className="font-display text-[10px] tracking-wider px-2.5 py-1 rounded-full border border-border text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-40"
      >
        Reset
      </button>
    </div>
  );
}

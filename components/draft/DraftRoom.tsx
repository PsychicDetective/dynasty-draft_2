"use client";
import { useEffect, useState } from "react";
import { useLiveDraft } from "@/hooks/useLiveDraft";
import { useDraftStore } from "@/lib/store";
import { TickerBar } from "./TickerBar";
import { OnTheClock } from "./OnTheClock";
import { DraftBoard } from "./DraftBoard";
import { BestAvailable } from "./BestAvailable";
import { TeamInfo } from "./TeamInfo";
import { Video, VideoOff, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import dynamic from "next/dynamic";

const PickModal = dynamic(
  () => import("./PickModal").then((m) => ({ default: m.PickModal })),
  { ssr: false },
);
const PickIsInOverlay = dynamic(
  () =>
    import("./PickIsInOverlay").then((m) => ({ default: m.PickIsInOverlay })),
  { ssr: false },
);

type SideTab = "available" | "team";

export function DraftRoom({
  leagueId,
  draftId,
}: {
  leagueId: string;
  draftId?: string;
}) {
  const { isLoading, error, refetch } = useLiveDraft(leagueId, draftId);
  const { draft } = useDraftStore();
  const [sideTab, setSideTab] = useState<SideTab>("available");

  useEffect(() => {
    const tryUnlock = () => {
      try {
        const ctx = new (
          window.AudioContext ?? (window as any).webkitAudioContext
        )();
        ctx.resume().then(() => ctx.close());
        const utterance = new SpeechSynthesisUtterance("");
        utterance.volume = 0;
        speechSynthesis.speak(utterance);
      } catch {}
    };

    // Try immediately — works when navigating from homepage where user already clicked
    tryUnlock();

    // Also listen for any interaction as backup
    const unlock = () => {
      tryUnlock();
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-pitch flex items-center justify-center font-display">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-black text-white mb-2 tracking-widest uppercase">
            Could not load draft
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {(error as any)?.info?.error ??
              error.message ??
              "Check your league ID and try again."}
          </p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-gold text-black font-display font-black text-sm rounded-lg hover:bg-gold/90 transition-colors"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-pitch font-display">
      <TickerBar />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <OnTheClock />
          {isLoading && !draft ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-600 font-display tracking-widest uppercase">
                  Loading draft…
                </p>
              </div>
            </div>
          ) : (
            <DraftBoard />
          )}
        </div>

        <div className="w-[300px] flex-shrink-0 bg-pitch-surface border-l border-border flex flex-col overflow-hidden">
          <div className="flex border-b border-border">
            {(["available", "team"] as SideTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setSideTab(tab)}
                className={clsx(
                  "flex-1 py-2.5 text-[10px] font-display font-black tracking-widest uppercase transition-colors border-b-2",
                  sideTab === tab
                    ? "text-gold border-gold"
                    : "text-gray-600 border-transparent hover:text-gray-400",
                )}
              >
                {tab === "available" ? "Best Avail" : "Team Info"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50">
            <span className="text-[9px] font-display font-bold tracking-widest text-gray-600 uppercase flex-1">
              Controls
            </span>
            <button
              onClick={refetch}
              title="Refresh"
              className="p-1.5 rounded text-gray-600 hover:text-gray-400 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            {sideTab === "available" ? <BestAvailable /> : <TeamInfo />}
          </div>
        </div>
      </div>

      <PickIsInOverlay />
      <PickModal />
    </div>
  );
}

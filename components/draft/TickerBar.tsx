"use client";
import { useDraftStore } from "@/lib/store";
import { PosBadge } from "@/components/ui/PosBadge";

export function TickerBar() {
  const draft = useDraftStore((s) => s.draft);
  const pendingPickNumber = useDraftStore((s) => s.pendingPickNumber);
  const donePicks = (draft?.allPicks ?? []).filter(
    (p) =>
      p.status === "complete" &&
      p.player &&
      p.overallPick !== pendingPickNumber,
  );
  const duration = Math.max(30, donePicks.length * 8);
  const items = [...donePicks, ...donePicks];

  return (
    <div className="flex h-[52px] bg-pitch-surface border-b border-border overflow-hidden">
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* Brand */}
      <div className="flex-shrink-0 bg-gold flex items-center gap-2 px-4 font-display font-black text-sm text-black tracking-widest">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        LIVE DRAFT
      </div>

      {/* Scroll */}
      <div className="flex-1 overflow-hidden flex items-center min-w-0">
        {donePicks.length === 0 ? (
          <p className="px-4 text-xs text-gray-600 font-display tracking-widest uppercase">
            Draft starting soon…
          </p>
        ) : (
          <div
            className="flex gap-10 whitespace-nowrap"
            style={{
              animation: `ticker-scroll ${duration}s linear infinite`,
              willChange: "transform",
              minWidth: "max-content",
            }}
          >
            {items.map((pick, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-xs font-display"
              >
                <span className="text-gold font-bold">
                  {pick.round}.{String(pick.pickInRound).padStart(2, "0")}
                </span>
                <span className="text-white font-semibold">
                  {pick.player!.fullName}
                </span>
                <PosBadge position={pick.player!.position} size="xs" />
                <span className="text-gray-500">·</span>
                <span className="text-gray-400">{pick.team?.teamName}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Round indicator */}
      {draft && (
        <div className="flex-shrink-0 flex items-center px-4 border-l border-border text-[10px] font-display font-bold tracking-widest text-gray-500 uppercase">
          Round {Math.ceil(draft.currentPickNumber / draft.totalTeams)} · Pick{" "}
          {draft.currentPickNumber}
        </div>
      )}
    </div>
  );
}

"use client";
import { useDraftStore } from "@/lib/store";
import { PosBadge } from "@/components/ui/PosBadge";

const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 — Elite",
  2: "Tier 2 — Strong Value",
  3: "Tier 3 — Depth",
  4: "Tier 4 — Late Round",
};

export function BestAvailable() {
  const draft = useDraftStore((s) => s.draft);
  const players = draft?.availablePlayers?.slice(0, 50) ?? [];

  if (!players.length) {
    return (
      <div className="p-4 text-center text-sm text-gray-600 font-display">
        No player data available
      </div>
    );
  }

  let lastTier = 0;
  return (
    <div>
      {players.map((player, i) => {
        const showTierHeader = player.tier !== lastTier;
        lastTier = player.tier;
        return (
          <div key={player.playerId}>
            {showTierHeader && (
              <div className="px-3 py-2 border-t border-border/50 first:border-t-0">
                <span className="text-[9px] font-display font-black tracking-[.14em] text-gray-600 uppercase">
                  {TIER_LABELS[player.tier]}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-pitch-surface3 cursor-pointer border-b border-border/40 transition-colors group">
              <span className="font-mono text-[10px] text-gray-700 w-5 flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[13px] text-white group-hover:text-gold transition-colors truncate leading-tight">
                  {player.fullName}
                </div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">
                  {player.nflTeam !== "FA" ? player.nflTeam : "Free Agent"} ·{" "}
                  {player.college}
                  {player.age && (
                    <span className="ml-1.5">Age {player.age}</span>
                  )}
                </div>
              </div>
              <PosBadge position={player.position} size="xs" />
              {player.adp && (
                <span className="font-mono text-[10px] text-gray-600 flex-shrink-0">
                  {player.adp}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

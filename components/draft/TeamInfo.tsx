"use client";
import { useDraftStore } from "@/lib/store";
import { PosBadge } from "@/components/ui/PosBadge";
import { TeamAvatar } from "@/components/ui/TeamAvatar";

const NEED_LABELS: Record<string, string> = {
  QB: "Quarterback",
  RB: "Running Back",
  WR: "Wide Receiver",
  TE: "Tight End",
  K: "Kicker",
  LB: "Linebacker",
  DL: "Defensive Line",
  DB: "Defensive Back",
};

export function TeamInfo() {
  const draft = useDraftStore((s) => s.draft);
  const currentPick = draft?.allPicks.find((p) => p.status === "current");
  const team = currentPick?.team;

  if (!team) {
    return (
      <div className="p-4 text-sm text-gray-600 font-display text-center">
        Waiting for draft to start…
      </div>
    );
  }

  const maxNeed = 4;
  const needValues: Record<string, number> = { WR: 90, RB: 65, QB: 45, TE: 30, K: 15 };

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Team header */}
      <div className="flex items-center gap-3">
        <TeamAvatar avatar={team.avatar} teamName={team.teamName} rosterId={team.rosterId} size={48} />
        <div>
          <div className="font-display font-black text-base text-white">{team.teamName}</div>
          <div className="text-xs text-gray-500">{team.ownerName}</div>
        </div>
      </div>

      {/* TODO: REMOVE Position needs */}
      <div>
        <div className="text-[9px] font-display font-black tracking-[.14em] text-gray-600 uppercase mb-2">
          Position Needs
        </div>
        {team.needs.map((pos) => {
          const pct = needValues[pos] ?? 50;
          return (
            <div key={pos} className="flex items-center gap-2 mb-2">
              <span className="text-xs font-display font-semibold text-gray-400 w-7">{pos}</span>
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-600 w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Remaining picks */}
      <div>
        <div className="text-[9px] font-display font-black tracking-[.14em] text-gray-600 uppercase mb-2">
          Remaining Picks
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {team.remainingPickSlots.map((slot) => (
            <span
              key={slot}
              className="font-mono text-[10px] bg-pitch-surface3 border border-border rounded px-1.5 py-0.5 text-gray-400"
            >
              {slot}
            </span>
          ))}
        </div>
      </div>

      {/* Current roster */}
      <div className="text-[9px] font-display font-black tracking-[.14em] text-gray-600 uppercase mb-2">
        Current Roster
      </div>
      {console.log("[roster] positions:", team.rosterPlayers.map(p => `${p.fullName}: "${p.position}"`))}
      {(["QB", "RB", "WR", "TE", "K", "LB", "DL", "DB"] as const).map((pos) => {
        const players = team.rosterPlayers.filter(p => {
          const positions = (p.position as string).split(",").map((s: string) => s.trim());
          return positions[positions.length - 1] === pos;
        });

        if (players.length === 0) return null;
        return (
          <div key={pos} className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <PosBadge position={pos} size="xs" />
              <span className="text-[9px] text-gray-600 font-mono">{players.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              {players.map((p) => {
                const positions = (p.position as string).split(",").map((s: string) => s.trim());
                const isMultiPos = positions.length > 1;
                return (
                  <div
                    key={p.playerId}
                    className={`flex items-center justify-between rounded px-2 py-1.5 border ${
                      isMultiPos
                        ? "bg-purple-500/10 border-purple-500/30"
                        : "bg-pitch-surface3 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[11px] font-display font-semibold truncate ${
                        isMultiPos ? "text-purple-300" : "text-white"
                      }`}>
                        {p.fullName}
                      </span>
                      {isMultiPos && (
                        <span className="text-[9px] text-purple-400 font-mono flex-shrink-0 bg-purple-500/20 px-1 rounded">
                          {p.position}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-600 font-mono flex-shrink-0 ml-2">
                      {p.nflTeam}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

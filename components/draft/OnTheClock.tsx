"use client";
import { useEffect, useState } from "react";
import { useDraftStore } from "@/lib/store";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { PosBadge } from "@/components/ui/PosBadge";
import { clsx } from "clsx";

export function OnTheClock() {
  const draft = useDraftStore((s) => s.draft);
  const currentPick = draft?.allPicks?.find((p) => p.status === "current");
  const team = currentPick?.team;

  const [seconds, setSeconds] = useState(draft?.pickTimer ?? 120);
  const pickTimer = draft?.pickTimer ?? 120;

  useEffect(() => {
    if (draft?.status !== "drafting") return;

    function calcSeconds() {
      const lastPicked = (draft as any)?.lastPicked ?? 0;
      const pickTimer = draft?.pickTimer ?? 120;
      if (!lastPicked) return pickTimer;
      const elapsed = Math.floor((Date.now() - lastPicked) / 1000);
      return Math.max(0, pickTimer - elapsed);
    }

    // Set immediately
    setSeconds(calcSeconds());

    // Then tick every second
    const id = setInterval(() => setSeconds(calcSeconds()), 1000);
    return () => clearInterval(id);
  }, [currentPick?.overallPick, draft?.status, draft]);

  const pct = Math.round((seconds / pickTimer) * 100);
  const isUrgent = seconds <= 30;

  if (!currentPick || !team) return null;

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <div className="bg-pitch-surface border-b border-border p-3 flex flex-col gap-2.5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-display font-black tracking-[.15em] text-gray-500 uppercase">
          🏈 On The Clock
        </span>
        <span className="text-[10px] font-display font-bold tracking-wider text-gold uppercase">
          Pick {currentPick.round}.
          {String(currentPick.pickInRound).padStart(2, "0")} · #
          {currentPick.overallPick} Overall
        </span>
      </div>

      {/* Team row */}
      <div className="flex items-center gap-3">
        <TeamAvatar
          avatar={team.avatar}
          teamName={team.teamName}
          rosterId={team.rosterId}
          size={46}
        />
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-xl leading-tight text-white truncate">
            {team.teamName}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {team.ownerName} · {team.remainingPickSlots.length} picks remaining
          </div>
        </div>
        {/* Clock */}
        <div className="flex flex-col items-end">
          <span
            className={clsx(
              "font-mono font-medium text-3xl leading-none tabular-nums",
              isUrgent ? "text-red-400 animate-pulse" : "text-gold",
            )}
          >
            {timeStr}
          </span>
          <span className="text-[9px] font-display tracking-widest text-gray-600 uppercase mt-0.5">
            time left
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-[3px] bg-border rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-1000",
            isUrgent ? "bg-red-400" : "bg-gold",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Needs */}
      {team.needs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-display font-bold tracking-[.14em] text-gray-600 uppercase">
            Needs:
          </span>
          {team.needs.map((pos) => (
            <PosBadge key={pos} position={pos} size="xs" />
          ))}
        </div>
      )}
    </div>
  );
}

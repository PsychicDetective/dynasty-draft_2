"use client";
import { useRef, useEffect } from "react";
import { useDraftStore } from "@/lib/store";
import { PosBadge } from "@/components/ui/PosBadge";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { clsx } from "clsx";

export function DraftBoard() {
  const draft = useDraftStore((s) => s.draft);
  const pendingPickNumber = useDraftStore((s) => s.pendingPickNumber);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [draft?.currentPickNumber]);

  if (!draft) return <BoardSkeleton />;

  const rounds: { round: number; picks: typeof draft.allPicks }[] = [];
  for (let r = 1; r <= draft.totalRounds; r++) {
    rounds.push({
      round: r,
      picks: draft.allPicks?.filter((p) => p.round === r) ?? [],
    });
  }

  return (
    <div className="flex-1 overflow-y-auto bg-pitch scrollbar-thin">
      {/* Header */}
      <div className="sticky top-0 z-10 grid grid-cols-[40px_1fr_56px_52px] gap-2 px-4 py-2 bg-pitch border-b border-border">
        {["PICK", "PLAYER", "TEAM", "POS"].map((h) => (
          <span
            key={h}
            className="text-[9px] font-display font-black tracking-[.14em] text-gray-600 uppercase"
          >
            {h}
          </span>
        ))}
      </div>

      {rounds.map(({ round, picks }) => (
        <div key={round}>
          {/* Round divider */}
          <div className="flex items-center gap-3 px-4 py-1.5 bg-pitch-surface/50 border-y border-border/50">
            <span className="text-[9px] font-display font-black tracking-[.14em] text-gray-600 uppercase">
              Round {round}
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {picks.map((pick) => {
            const isPendingReveal = pick.overallPick === pendingPickNumber;
            const displayPick = isPendingReveal
              ? { ...pick, status: "current" as const, player: null }
              : pick;
            const status = displayPick.status;
            const isCurrent = status === "current";
            const isDone = status === "complete";

            return (
              <div
                key={pick.overallPick}
                ref={isCurrent ? currentRef : undefined}
                className={clsx(
                  "grid grid-cols-[40px_1fr_56px_52px] gap-2 px-4 py-2.5 border-b border-border/40 items-center transition-colors hover:bg-pitch-surface2",
                  isCurrent &&
                    isPendingReveal &&
                    "bg-red-500/5 border-l-2 border-l-red-500 pl-[14px]",
                  isCurrent &&
                    !isPendingReveal &&
                    "animate-row-glow border-l-2 border-l-gold pl-[14px]",
                  isDone && "opacity-55",
                  !isDone && !isCurrent && "opacity-35",
                )}
              >
                {/* Pick number */}
                <span
                  className={clsx(
                    "font-mono text-[11px]",
                    isCurrent && isPendingReveal && "text-red-400 font-bold",
                    isCurrent && !isPendingReveal && "text-gold font-bold",
                    !isCurrent && "text-gray-600",
                  )}
                >
                  {displayPick.round}.
                  {String(displayPick.pickInRound).padStart(2, "0")}
                </span>

                {/* Player info */}
                {isDone && displayPick.player ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-display font-bold text-[13px] text-white leading-tight truncate">
                        {displayPick.player.fullName}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate">
                        {displayPick.player.college}
                      </span>
                    </div>
                  </div>
                ) : isCurrent ? (
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={clsx(
                        "font-display font-bold text-[13px] animate-pulse",
                        isPendingReveal ? "text-red-400" : "text-gold",
                      )}
                    >
                      {isPendingReveal
                        ? "⏳ Pick pending reveal…"
                        : "⏳ Selecting…"}
                    </span>
                    <span className="text-[10px] text-gray-600 truncate">
                      {displayPick.team?.teamName}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-700 italic font-display truncate">
                    {displayPick.team?.teamName ?? "—"}
                  </span>
                )}

                {/* Team */}
                <span className="text-[11px] text-gray-500 font-display font-semibold truncate">
                  {displayPick.team?.teamName?.split(" ").slice(-1)[0] ?? "—"}
                </span>

                {/* Position */}
                {isDone && displayPick.player ? (
                  <PosBadge position={displayPick.player.position} size="xs" />
                ) : isCurrent ? (
                  <span
                    className={clsx(
                      "text-[9px] font-display font-black px-1.5 py-0.5 rounded border",
                      isPendingReveal
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-gold/20 text-gold border-gold/30",
                    )}
                  >
                    ?
                  </span>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex-1 overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[40px_1fr_56px_52px] gap-2 px-4 py-3 border-b border-border/40"
        >
          <div className="h-3 w-8 bg-pitch-surface3 rounded animate-pulse" />
          <div className="h-3 w-32 bg-pitch-surface3 rounded animate-pulse" />
          <div className="h-3 w-12 bg-pitch-surface3 rounded animate-pulse" />
          <div className="h-3 w-8 bg-pitch-surface3 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

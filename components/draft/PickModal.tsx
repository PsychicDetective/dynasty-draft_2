"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useDraftStore } from "@/lib/store";
import { useDraftReveal } from "@/hooks/useDraftReveal";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { PosBadge } from "@/components/ui/PosBadge";
import { GradePill } from "@/components/ui/GradePill";

export function PickModal() {
  const announcement = useDraftStore((s) => s.announcement);
  const { onRevealComplete } = useDraftReveal();
  const [videoReady, setVideoReady] = useState(false);

  const pick = announcement?.pick;
  const player = pick?.player;
  const team = pick?.team;

  useEffect(() => {
    setVideoReady(false);
  }, [pick?.overallPick]);

  useEffect(() => {
    if (!announcement) return;
    const id = setTimeout(onRevealComplete, 30_000);
    return () => clearTimeout(id);
  }, [announcement, onRevealComplete]);

  return (
    <AnimatePresence>
      {announcement && player && team && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onRevealComplete}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-[5vh] pointer-events-none"
          >
            <div className="pointer-events-auto w-[90vw] h-[90vh] bg-pitch-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Gold top bar */}
              <div className="h-1 bg-gold w-full flex-shrink-0" />

              {/* Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* ── Left: Draft Card ── */}
                <div className="w-[220px] flex-shrink-0 p-4 flex flex-col gap-3 border-r border-border overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-display font-black tracking-[.15em] text-gold uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse inline-block" />
                      Pick Selected
                    </span>
                    <button
                      onClick={onRevealComplete}
                      className="text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Player headshot */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-pitch-surface3 border border-border">
                      <img
                        src={`https://sleepercdn.com/content/nfl/players/${player.playerId}.jpg`}
                        alt={player.fullName}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.src = `https://sleepercdn.com/content/nfl/players/thumb/${player.playerId}.jpg`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Player name + position */}
                  <div className="text-center">
                    <div className="font-display font-black text-xl text-white leading-tight">
                      {player.fullName}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                      <PosBadge position={player.position} size="md" />
                      <span className="text-sm text-gray-500">
                        {player.college}
                      </span>
                    </div>
                    {player.nflTeam && player.nflTeam !== "FA" && (
                      <div className="text-xs text-gray-600 mt-1">
                        {player.nflTeam}
                      </div>
                    )}
                  </div>

                  {/* Pick info */}
                  <div className="bg-pitch-surface3 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                        Pick
                      </span>
                      <span className="font-mono text-sm text-gold font-bold">
                        {pick.round}.{String(pick.pickInRound).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                        Overall
                      </span>
                      <span className="font-mono text-sm text-white">
                        #{pick.overallPick}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center gap-2">
                      <TeamAvatar
                        avatar={team.avatar}
                        teamName={team.teamName}
                        rosterId={team.rosterId}
                        size={20}
                      />
                      <span className="text-xs text-gray-400 font-display font-semibold truncate">
                        {team.teamName}
                      </span>
                    </div>
                  </div>

                  {/* AI grade */}
                  {/* AI grade + VAR */}
                  {announcement.grade && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <GradePill grade={announcement.grade.grade} />
                        <span className="text-xs text-gray-500 leading-tight">
                          {announcement.grade.description}
                        </span>
                      </div>
                      {(announcement as any).var != null && (
                        <div className="flex items-center justify-between bg-pitch-surface3 rounded-lg px-2.5 py-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">
                              VAR
                            </span>
                            <span
                              className={`font-mono text-sm font-bold ${
                                (announcement as any).var > 0
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              +{(announcement as any).var} pts
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">
                              Proj
                            </span>
                            <span className="font-mono text-sm text-white">
                              {(announcement as any).projectedPts}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">
                              Repl
                            </span>
                            <span className="font-mono text-sm text-gray-500">
                              {(announcement as any).replacementPts}
                            </span>
                          </div>
                        </div>
                      )}
                      {(announcement as any).ecr != null && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                            ECR
                          </span>
                          <span className="font-mono text-sm text-gray-400">
                            #{Math.round((announcement as any).ecr)}
                            {(announcement as any).diff != null && (
                              <span
                                className={`ml-1.5 text-[10px] ${
                                  (announcement as any).diff < 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {(announcement as any).diff < 0 ? "▲" : "▼"}
                                {Math.abs(
                                  Math.round((announcement as any).diff),
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI commentary */}
                  {announcement.commentary && (
                    <p className="text-[11px] text-gray-600 italic leading-relaxed border-l-2 border-gold/30 pl-2.5">
                      {announcement.commentary}
                    </p>
                  )}
                </div>

                {/* ── Right: Video ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
                    <span className="text-[10px] font-display font-black tracking-[.15em] text-gray-600 uppercase">
                      Highlights
                    </span>
                    {!announcement.videoId && (
                      <span className="text-[10px] text-gray-700 italic">
                        No video in DB
                      </span>
                    )}
                  </div>

                  {announcement.videoId ? (
                    <div className="relative flex-1">
                      {!videoReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-pitch-surface3 z-10">
                          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                        </div>
                      )}
                      <iframe
                        id="yt-player"
                        key={announcement.videoId}
                        src={`https://www.youtube-nocookie.com/embed/${announcement.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                        title={`${player.fullName} highlights`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => {
                          setVideoReady(true);
                          setTimeout(() => {
                            const iframe = document.getElementById(
                              "yt-player",
                            ) as HTMLIFrameElement;
                            if (iframe?.contentWindow) {
                              iframe.contentWindow.postMessage(
                                JSON.stringify({
                                  event: "command",
                                  func: "unMute",
                                  args: [],
                                }),
                                "*",
                              );
                              iframe.contentWindow.postMessage(
                                JSON.stringify({
                                  event: "command",
                                  func: "setVolume",
                                  args: [100],
                                }),
                                "*",
                              );
                            }
                          }, 500);
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center flex-col gap-3 p-8 text-center">
                      <div className="text-4xl">🎬</div>
                      <p className="text-sm text-gray-600 font-display">
                        No highlight video for {player.fullName} yet.
                      </p>
                      <p className="text-xs text-gray-700">
                        Add one with:
                        <br />
                        <code className="text-gold text-[11px]">
                          npm run highlights:add "{player.fullName}" VIDEO_ID
                          college
                        </code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

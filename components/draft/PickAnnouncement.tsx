"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YouTube from "react-youtube";
import { useDraftStore } from "@/lib/store";
import { PosBadge } from "@/components/ui/PosBadge";
import { GradePill } from "@/components/ui/GradePill";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { X } from "lucide-react";
import { PlayerAvatar } from "../ui/PlayerAvatar";

export function PickAnnouncement() {
  const { announcement, dismissAnnouncement } = useDraftStore();

  // Auto-dismiss after 20 seconds
  useEffect(() => {
    if (!announcement) return;
    const id = setTimeout(dismissAnnouncement, 20_000);
    return () => clearTimeout(id);
  }, [announcement, dismissAnnouncement]);

  const pick = announcement?.pick;
  const player = pick?.player;
  const team = pick?.team;

  return (
    <AnimatePresence>
      {announcement && player && team && (
        <motion.div
          key={pick.overallPick}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 z-50 w-[360px] bg-pitch-surface border border-border/80 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Gold accent bar */}
          <div className="h-1 bg-gold w-full" />

          <div className="p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-display font-black tracking-[.15em] text-gold uppercase animate-pulse">
                  ● Pick Announced
                </span>
              </div>
              <button
                onClick={dismissAnnouncement}
                className="text-gray-600 hover:text-gray-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Pick info */}
            <div className="flex items-center gap-3">
              <PlayerAvatar playerId={player.playerId} name={player.fullName} size={52} />
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-lg text-white leading-tight">
                  {player.fullName}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-1.5">
                  <TeamAvatar avatar={team.avatar} teamName={team.teamName} rosterId={team.rosterId} size={16} />
                  {team.teamName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <PosBadge position={player.position} size="xs" />
                  <span className="text-[10px] text-gray-500">{player.college}</span>
                  <span className="text-[10px] text-gray-600">
                    {pick.round}.{String(pick.pickInRound).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Announcement script */}
            <p className="text-[12px] text-gray-400 italic leading-relaxed border-l-2 border-gold/40 pl-3">
              "With the {pick.round}.{String(pick.pickInRound).padStart(2, "0")} pick, the{" "}
              {team.teamName} select {player.fullName}, {player.position.toLowerCase()}, from{" "}
              {player.college}."
            </p>

            {/* AI pick grade */}
            {announcement.grade && (
              <div className="flex items-center gap-2">
                <GradePill grade={announcement.grade.grade} />
                <span className="text-[11px] text-gray-500">{announcement.grade.description}</span>
              </div>
            )}

            {/* AI commentary */}
            {announcement.commentary && (
              <p className="text-[11px] text-gray-500 leading-relaxed">
                💬 {announcement.commentary}
              </p>
            )}

            {/* YouTube highlight */}
            {announcement.videoId && (
              <div className="rounded-lg overflow-hidden aspect-video">
                <YouTube
                  videoId={announcement.videoId}
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: { autoplay: 1, mute: 0, controls: 1, rel: 0 },
                  }}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

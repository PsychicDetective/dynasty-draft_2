"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useDraftReveal } from "@/hooks/useDraftReveal";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { buildAnnouncementText } from "@/lib/utils/position";
import { useEffect, useRef } from "react";
import { useSpeech } from "react-text-to-speech";
import { LazyMotion, domAnimation, m } from "framer-motion";

export function PickIsInOverlay() {
  const {
    revealState,
    pendingPick,
    onAnnouncementStart,
    onAnnouncementEnd,
    pickQueue,
  } = useDraftReveal();

  const pick = pendingPick?.pick;
  const team = pick?.team;
  const player = pick?.player;

  const hasFiredRef = useRef(false);
  const voiceName = pendingPick?.voiceName ?? "Google US English";
  const language = pendingPick?.language ?? "en";
  console.log(pick, team, player, hasFiredRef, voiceName, language);
  const announcementText =
    pick && player && team
      ? buildAnnouncementText(
          pick.overallPick,
          new Date().getFullYear(),
          team.teamName,
          player.fullName,
          player.position,
          player.college ?? "Unknown",
        )
      : "";

  const speechProps = {
    text: announcementText,
    lang: language,
    onStart: onAnnouncementStart,
    onStop: () => {
      if (!hasFiredRef.current) {
        hasFiredRef.current = true;
        onAnnouncementEnd();
      }
    },
    ...(voiceName ? { voiceURI: voiceName } : {}),
  };
  const { start, stop, speechStatus } = useSpeech(speechProps);

  // Auto-start TTS when state becomes ANNOUNCING_PICK
  useEffect(() => {
    if (revealState === "ANNOUNCING_PICK" && speechStatus === "stopped") {
      hasFiredRef.current = false;
      start();
    }
  }, [revealState, speechStatus, start]);

  // Reset when new pick comes in
  useEffect(() => {
    if (revealState === "PICK_IS_IN") {
      hasFiredRef.current = false;
      stop();
    }
  }, [revealState, stop]);

  const visible =
    revealState === "PICK_IS_IN" || revealState === "ANNOUNCING_PICK";

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {visible && team && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
            >
              {/* Live indicator + headline */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-display font-black tracking-[.2em] text-red-400 uppercase">
                    Selection Made
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tight text-center leading-none">
                  THE PICK
                  <br />
                  IS IN
                </h1>
              </motion.div>

              {/* Team — visible */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-3"
              >
                <TeamAvatar
                  avatar={team.avatar}
                  teamName={team.teamName}
                  rosterId={team.rosterId}
                  size={72}
                />
                <div className="text-center">
                  <div className="text-2xl font-display font-black text-white">
                    {team.teamName}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 font-mono">
                    Pick {pick?.round}.
                    {String(pick?.pickInRound ?? 0).padStart(2, "0")} · #
                    {pick?.overallPick} Overall
                  </div>
                </div>
              </motion.div>

              {/* Hidden player */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 rounded-full bg-pitch-surface3 border-2 border-border flex items-center justify-center">
                  <span className="text-4xl">?</span>
                </div>
              </motion.div>

              {/* Countdown bar — 5 second fill */}
              {revealState === "PICK_IS_IN" && (
                <motion.div className="w-64 flex flex-col items-center gap-2">
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[10px] font-display tracking-widest text-gray-600 uppercase">
                    Announcing soon…
                  </span>
                  {/* Queue indicator */}
                  {pickQueue.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 bg-pitch-surface/80 border border-border rounded-full px-3 py-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-display font-black tracking-widest text-amber-400 uppercase">
                        {pickQueue.length - 1} more pick
                        {pickQueue.length - 1 > 1 ? "s" : ""} queued
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* TTS in progress */}
              {revealState === "ANNOUNCING_PICK" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-1.5 h-6">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-gold rounded-full"
                        style={{ height: "24px", transformOrigin: "center" }}
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 0.6,
                          delay: i * 0.1,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-display text-gold tracking-widest uppercase">
                    Announcing…
                  </span>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

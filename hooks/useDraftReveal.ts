"use client";
import { useCallback, useRef, useEffect } from "react";
import { useDraftStore } from "@/lib/store";
import type { AnnouncementPayload } from "@/types/draft";
import { usePickSound } from "./usePickSound";
import { getTeamConfig } from "@/lib/teamConfig";

export function useDraftReveal() {
  const {
    revealState,
    setRevealState,
    pickQueue,
    enqueuePick,
    shiftQueue,
    clearQueue,
    setAnnouncement,
    setPendingPickNumber,
  } = useDraftStore();

  const { playPickIsIn } = usePickSound();
  const autoAnnounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);
  const revealStateRef = useRef(revealState);
  useEffect(() => {
    revealStateRef.current = revealState;
  }, [revealState]);

  // Reset ALL state on mount to avoid stale state from hot reload / refresh
  useEffect(() => {
    isProcessingRef.current = false;
    clearQueue();
    setAnnouncement(null);
    setPendingPickNumber(null);
    setRevealState("WAITING_FOR_PICK");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAutoTimer = useCallback(() => {
    if (autoAnnounceTimer.current) {
      clearTimeout(autoAnnounceTimer.current);
      autoAnnounceTimer.current = null;
    }
  }, []);

  const startProcessing = useCallback(
    async (payload: AnnouncementPayload) => {
      const config = getTeamConfig(payload.pick.rosterId);
      setPendingPickNumber(payload.pick.overallPick);
      setRevealState("PICK_IS_IN");
      playPickIsIn(config.soundFile);

      clearAutoTimer();
      autoAnnounceTimer.current = setTimeout(() => {
        if (revealStateRef.current === "PICK_IS_IN") {
          setRevealState("ANNOUNCING_PICK");
        }
      }, 5000);
    },
    [playPickIsIn, setPendingPickNumber, setRevealState, clearAutoTimer],
  );

  // Watch queue — process next pick when idle
  useEffect(() => {
    if (
      pickQueue.length > 0 &&
      revealState === "WAITING_FOR_PICK" &&
      !isProcessingRef.current
    ) {
      isProcessingRef.current = true;
      const next = pickQueue[0];
      useDraftStore.setState({ pendingPick: next });
      startProcessing(next);
    }
  }, [pickQueue, revealState, startProcessing]);

  const onPickDetected = useCallback(
    (payload: AnnouncementPayload) => {
      const config = getTeamConfig(payload.pick.rosterId);
      const enriched: AnnouncementPayload = {
        ...payload,
        voiceName: config.voiceName,
        language: config.language,
      };
      enqueuePick(enriched);
    },
    [enqueuePick],
  );

  const triggerReveal = useCallback(() => {
    clearAutoTimer();
    if (revealStateRef.current !== "PICK_IS_IN") return;
    setRevealState("ANNOUNCING_PICK");
  }, [setRevealState, clearAutoTimer]);

  const onAnnouncementStart = useCallback(() => {
    setRevealState("ANNOUNCING_PICK");
  }, [setRevealState]);

  const onAnnouncementEnd = useCallback(() => {
    const currentPendingPick = useDraftStore.getState().pendingPick;
    if (!currentPendingPick) return;
    setRevealState("REVEALING_PICK");
    setTimeout(() => {
      setAnnouncement(currentPendingPick);
      setRevealState("PLAYING_HIGHLIGHT");
    }, 300);
  }, [setRevealState, setAnnouncement]);

  const onRevealComplete = useCallback(() => {
    clearAutoTimer();
    isProcessingRef.current = false;
    setAnnouncement(null);
    setPendingPickNumber(null);
    shiftQueue();
    setTimeout(() => {
      setRevealState("WAITING_FOR_PICK");
    }, 100);
  }, [
    clearAutoTimer,
    setAnnouncement,
    setPendingPickNumber,
    shiftQueue,
    setRevealState,
  ]);

  const pendingPick = useDraftStore((s) => s.pendingPick);

  return {
    revealState,
    pendingPick,
    pickQueue,
    onPickDetected,
    triggerReveal,
    onAnnouncementStart,
    onAnnouncementEnd,
    onRevealComplete,
  };
}

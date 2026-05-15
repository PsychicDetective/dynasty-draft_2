"use client";

import { useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { useDraftStore } from "@/lib/store";
import { useDraftReveal } from "./useDraftReveal";
import type { DraftState, DraftPick } from "@/types/draft";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error ?? `HTTP ${res.status}`);
    (err as any).info = body;
    throw err;
  }
  return res.json();
};

const ACTIVE_INTERVAL = 3_000;
const IDLE_INTERVAL = 10_000;

export function useLiveDraft(leagueId: string, draftId?: string) {
  const { draft, setDraft } = useDraftStore();
  const { onPickDetected } = useDraftReveal();
  const prevPickCount = useRef<number>(-1);
  const isActive = draft?.status === "drafting";

  const isMock =
    leagueId === "mock" ||
    leagueId === "test" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true";
  const endpoint = isMock
    ? "/api/sleeper/mock"
    : `/api/sleeper/league?leagueId=${leagueId}${draftId ? `&draftId=${draftId}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<DraftState>(
    leagueId ? endpoint : null,
    fetcher,
    {
      refreshInterval: isActive ? ACTIVE_INTERVAL : IDLE_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    },
  );

  const handleNewPick = useCallback(
    async (pick: DraftPick) => {
      if (!pick.player) return;
      console.log(
        "[draft] Player fullName:",
        JSON.stringify(pick.player.fullName),
      );

      const currentDraft = useDraftStore.getState().draft;

      const res = await fetch("/api/ai/grade", {
        method: "POST",
        body: JSON.stringify({
          pick,
          scoringSettings: currentDraft?.scoringSettings ?? {},
          rosterPositions: currentDraft?.rosterPositions ?? [],
          numTeams: currentDraft?.totalTeams ?? 12,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      console.log(
        "[draft] grade API response videoId:",
        data.videoId,
        "grade:",
        data.grade,
      );

      onPickDetected({
        pick,
        videoId: data.videoId ?? null,
        grade: data.grade ? data : undefined,
        commentary: data.commentary,
        ecr: data.ecr ?? null,
        diff: data.diff ?? null,
        var: data.var ?? null,
        projectedPts: data.projectedPts ?? null,
        replacementPts: data.replacementPts ?? null,
        scoringSettings: currentDraft?.scoringSettings ?? {},
        rosterPositions: currentDraft?.rosterPositions ?? [],
        numTeams: currentDraft?.totalTeams ?? 12,
      });
    },
    [onPickDetected],
  );

  useEffect(() => {
    if (!data) return;
    setDraft(data);

    const completed = (data.allPicks ?? []).filter(
      (p) => p.status === "complete",
    );
    const newCount = completed.length;

    if (prevPickCount.current === -1) {
      prevPickCount.current = newCount;
      return;
    }

    if (newCount > prevPickCount.current) {
      const newPicks = completed.slice(prevPickCount.current);
      console.log(
        "[draft] New picks detected:",
        newPicks.map((p) => p.player?.fullName),
      );
      for (const pick of newPicks) {
        handleNewPick(pick);
      }
    }

    prevPickCount.current = newCount;
  }, [data, setDraft, handleNewPick]);

  return { draft, isLoading, error, refetch: mutate };
}

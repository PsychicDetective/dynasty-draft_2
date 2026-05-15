// ─── Sleeper API client ───────────────────────────────────────────────────────
// All requests go through Next.js API routes (server-side) to avoid CORS.
// Direct calls here are used from API routes only.

import type {
  SleeperUser,
  SleeperLeague,
  SleeperRoster,
  SleeperDraft,
  SleeperPick,
  SleeperTradedPick,
  SleeperPlayer,
} from "@/types/sleeper";

const BASE = "https://api.sleeper.app/v1";

async function sleepFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 0 }, // always fresh for draft data
    headers: { "User-Agent": "DynastyDraftApp/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Sleeper API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── League ──────────────────────────────────────────────────────────────────
export const getLeague = (leagueId: string) =>
  sleepFetch<SleeperLeague>(`/league/${leagueId}`);

export const getLeagueUsers = (leagueId: string) =>
  sleepFetch<SleeperUser[]>(`/league/${leagueId}/users`);

export const getLeagueRosters = (leagueId: string) =>
  sleepFetch<SleeperRoster[]>(`/league/${leagueId}/rosters`);

// ── Draft ────────────────────────────────────────────────────────────────────
export const getDraftsForLeague = (leagueId: string) =>
  sleepFetch<SleeperDraft[]>(`/league/${leagueId}/drafts`);

export const getDraft = (draftId: string) =>
  sleepFetch<SleeperDraft>(`/draft/${draftId}`);

export const getDraftPicks = (draftId: string) =>
  sleepFetch<SleeperPick[]>(`/draft/${draftId}/picks`);

export const getTradedPicks = (draftId: string) =>
  sleepFetch<SleeperTradedPick[]>(`/draft/${draftId}/traded_picks`);

// ── Players ──────────────────────────────────────────────────────────────────
// Returns the full NFL player DB (~7MB). Cache this aggressively.
export const getAllPlayers = () =>
  sleepFetch<Record<string, SleeperPlayer>>(`/players/nfl`);

// ── Avatar URL helper ────────────────────────────────────────────────────────
export const avatarUrl = (avatarId: string | null, size: "thumb" | "full" = "thumb") =>
  avatarId
    ? `https://sleepercdn.com/avatars/${size === "thumb" ? "thumbs/" : ""}${avatarId}`
    : null;

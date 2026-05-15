// GET /api/sleeper/league?leagueId=xxx
// Returns the full mapped DraftState for the league's active draft.

import { NextRequest, NextResponse } from "next/server";
import {
  getLeague,
  getLeagueUsers,
  getLeagueRosters,
  getDraftsForLeague,
  getDraft,
  getDraftPicks,
  getTradedPicks,
} from "@/lib/sleeper/api";
import { buildDraftState } from "@/lib/sleeper/mappers";
import { getPlayerDb } from "@/lib/sleeper/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get("leagueId");
  const draftId = req.nextUrl.searchParams.get("draftId");
  if (!leagueId) {
    return NextResponse.json({ error: "leagueId required" }, { status: 400 });
  }

  try {
    // Fetch all Sleeper data in parallel
    let league, users, rosters, drafts, playerDb;
    try {
      [league, users, rosters, drafts, playerDb] = await Promise.all([
        getLeague(leagueId),
        getLeagueUsers(leagueId),
        getLeagueRosters(leagueId),
        getDraftsForLeague(leagueId),
        getPlayerDb(),
      ]);
    } catch (fetchErr) {
      const msg =
        fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      if (msg.includes("404")) {
        return NextResponse.json(
          {
            error: `League "${leagueId}" not found. Double-check the ID from your Sleeper URL.`,
            code: "LEAGUE_NOT_FOUND",
          },
          { status: 404 },
        );
      }
      throw fetchErr;
    }

    if (!drafts || drafts.length === 0) {
      return NextResponse.json(
        { error: "No drafts found for this league yet.", code: "NO_DRAFTS" },
        { status: 404 },
      );
    }

    /// Sort drafts by season descending, then prefer active statuses
    const sortedDrafts = [...drafts].sort((a, b) => {
      // Prefer currently drafting
      if (a.status === "drafting" && b.status !== "drafting") return -1;
      if (b.status === "drafting" && a.status !== "drafting") return 1;
      // Prefer pre_draft over complete
      if (a.status === "pre_draft" && b.status === "complete") return -1;
      if (b.status === "pre_draft" && a.status === "complete") return 1;
      // Sort by season descending
      return parseInt(b.season) - parseInt(a.season);
    });

    const draftId = req.nextUrl.searchParams.get("draftId");

    // After fetching drafts:
    const activeDraft = draftId
      ? (drafts.find((d) => d.draft_id === draftId) ?? sortedDrafts[0])
      : sortedDrafts[0];

    const [draft, picks, tradedPicks] = await Promise.all([
      getDraft(activeDraft.draft_id),
      getDraftPicks(activeDraft.draft_id),
      getTradedPicks(activeDraft.draft_id).catch(() => []), // 404 = no trades, that's fine
    ]);

    const state = buildDraftState(
      league!,
      users!,
      rosters!,
      draft,
      picks,
      tradedPicks,
      playerDb!,
    );

    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[api/sleeper/league]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

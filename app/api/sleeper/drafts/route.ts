import { NextRequest, NextResponse } from "next/server";
import { getDraftsForLeague } from "@/lib/sleeper/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get("leagueId");
  if (!leagueId)
    return NextResponse.json({ error: "leagueId required" }, { status: 400 });

  try {
    const drafts = await getDraftsForLeague(leagueId);
    return NextResponse.json(drafts);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch drafts" },
      { status: 500 },
    );
  }
}

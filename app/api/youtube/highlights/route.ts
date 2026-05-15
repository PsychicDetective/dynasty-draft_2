// GET /api/youtube/highlights?player=Marvin+Harrison+Jr.
// Looks up the player in the local highlights DB — no API key required.

import { NextRequest, NextResponse } from "next/server";
import { getHighlight } from "@/lib/youtube/db";

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player") ?? "";
  if (!player) {
    return NextResponse.json({ error: "player required" }, { status: 400 });
  }

  const video = getHighlight(player);

  return NextResponse.json(
    video ?? { videoId: null },
    // DB is static — safe to cache for the whole draft session
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );
}

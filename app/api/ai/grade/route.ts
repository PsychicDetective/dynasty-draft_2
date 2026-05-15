import { NextRequest, NextResponse } from "next/server";
import type { DraftPick } from "@/types/draft";
import { getHighlight } from "@/lib/youtube/db";
import { findPlayerRanking } from "@/lib/rankings";
import { calculateVAR, type LeagueConfig } from "@/lib/var";

export async function POST(req: NextRequest) {
  const {
    pick,
    scoringSettings,
    rosterPositions,
    numTeams,
  }: {
    pick: DraftPick;
    scoringSettings?: Record<string, number>;
    rosterPositions?: string[];
    numTeams?: number;
  } = await req.json();

  if (!pick?.player) {
    return NextResponse.json(
      { error: "pick.player required" },
      { status: 400 },
    );
  }

  const video = getHighlight(pick.player.fullName);
  const ranking = findPlayerRanking(pick.player.fullName);

  let grade,
    description,
    valueScore,
    commentary,
    ecr,
    diff,
    varValue,
    projectedPts,
    replacementPts;

  if (ranking && scoringSettings && rosterPositions && numTeams) {
    const config: LeagueConfig = { numTeams, rosterPositions, scoringSettings };

    const varResult = calculateVAR(
      pick.player.fullName,
      ranking.rank,
      ranking.position,
      pick.overallPick,
      pick.team?.teamName ?? "Unknown",
      config,
    );

    const ecrDiff = pick.overallPick - ranking.avg;

    grade = varResult.grade;
    description = varResult.description;
    valueScore = varResult.valueScore;
    commentary = varResult.commentary;
    ecr = ranking.avg;
    diff = ecrDiff;
    varValue = varResult.var;
    projectedPts = varResult.projectedPts;
    replacementPts = varResult.replacementPts;
  } else if (ranking) {
    const ecrDiff = pick.overallPick - ranking.avg;
    const stdDev = Math.max(ranking.stdDev, 2);
    const normalizedDiff = ecrDiff / stdDev;
    grade =
      normalizedDiff <= -2
        ? "A"
        : normalizedDiff <= 0
          ? "B+"
          : normalizedDiff <= 2
            ? "B"
            : "C";
    description = `ECR: ${Math.round(ranking.avg)}, Pick: ${pick.overallPick}`;
    valueScore = 60;
    commentary = `${pick.team?.teamName} selects ${pick.player.fullName}.`;
    ecr = ranking.avg;
    diff = ecrDiff;
    varValue = null;
    projectedPts = null;
    replacementPts = null;
  } else {
    grade = "B";
    description = "Player not in 2026 rookie rankings.";
    valueScore = 50;
    commentary = `${pick.team?.teamName ?? "Unknown"} makes their selection.`;
    ecr = null;
    diff = null;
    varValue = null;
    projectedPts = null;
    replacementPts = null;
  }

  return NextResponse.json({
    grade,
    description,
    valueScore,
    commentary,
    ecr,
    diff,
    var: varValue,
    projectedPts,
    replacementPts,
    videoId: video?.videoId ?? null,
  });
}

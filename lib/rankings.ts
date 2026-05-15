import fs from "fs";
import path from "path";

export interface PlayerRanking {
  rank: number;
  name: string;
  team: string;
  position: string;
  tier: number;
  avg: number;
  best: number;
  worst: number;
  stdDev: number;
}

export interface PickGradeResult {
  grade: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "F";
  description: string;
  valueScore: number;
  ecr: number | null;
  pickNumber: number;
  diff: number | null;
  commentary: string;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+jr\.?$/i, "")
    .replace(/\s+sr\.?$/i, "")
    .replace(/\s+ii$/i, "")
    .replace(/\s+iii$/i, "")
    .replace(/[^a-z\s]/g, "")
    .trim();
}

function parseRankings(filePath: string, hasOverall: boolean): PlayerRanking[] {
  if (!fs.existsSync(filePath)) {
    console.log("[rankings] file not found:", filePath);
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n").filter(Boolean);
  console.log(
    "[rankings] file:",
    filePath,
    "lines:",
    lines.length,
    "first line:",
    lines[0],
  );
  console.log("[rankings] second line:", lines[1]);
  const results: PlayerRanking[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
    if (!cols[0] || isNaN(parseInt(cols[0]))) continue;

    if (hasOverall) {
      results.push({
        rank: parseInt(cols[0]),
        tier: parseInt(cols[1]) || 1,
        name: cols[2],
        team: cols[3],
        position: cols[4],
        avg: parseFloat(cols[11]) || parseInt(cols[0]),
        best: parseInt(cols[9]) || parseInt(cols[0]),
        worst: parseInt(cols[10]) || parseInt(cols[0]),
        stdDev: parseFloat(cols[12]) || 0,
      });
    } else {
      results.push({
        rank: parseInt(cols[0]),
        tier: parseInt(cols[1]) || 1,
        name: cols[2],
        team: cols[3],
        position: cols[4],
        avg: parseFloat(cols[8]) || parseInt(cols[0]),
        best: parseInt(cols[6]) || parseInt(cols[0]),
        worst: parseInt(cols[7]) || parseInt(cols[0]),
        stdDev: parseFloat(cols[9]) || 0,
      });
    }
  }
  return results;
}

let cachedRankings: PlayerRanking[] | null = null;

function getRankings(): PlayerRanking[] {
  if (cachedRankings) return cachedRankings;
  const offense = parseRankings(
    path.join(process.cwd(), "data", "rankings-offense.csv"),
    true,
  );
  const idp = parseRankings(
    path.join(process.cwd(), "data", "rankings-idp.csv"),
    false,
  );
  console.log("[rankings] loaded offense:", offense.length, "idp:", idp.length);
  cachedRankings = [...offense, ...idp];
  return cachedRankings;
}

export function findPlayerRanking(playerName: string): PlayerRanking | null {
  const rankings = getRankings();
  const needle = normalizeName(playerName);
  console.log(
    "[rankings] looking up:",
    needle,
    "total players:",
    rankings.length,
  );

  let match = rankings.find((r) => normalizeName(r.name) === needle);
  console.log("[rankings] exact match:", match?.name ?? "none");
  if (match) return match;

  const lastName = needle.split(" ").slice(-1)[0];
  match = rankings.find((r) => normalizeName(r.name).endsWith(lastName));
  return match ?? null;
}

export function gradePickFromRankings(
  playerName: string,
  overallPick: number,
  teamName: string,
): PickGradeResult {
  const ranking = findPlayerRanking(playerName);

  if (!ranking) {
    return {
      grade: "B",
      description: "Player not in 2026 rankings database.",
      valueScore: 50,
      ecr: null,
      pickNumber: overallPick,
      diff: null,
      commentary: `${teamName} makes their selection.`,
    };
  }

  const ecr = ranking.avg;
  const diff = overallPick - ecr;
  const stdDev = Math.max(ranking.stdDev, 2);
  const normalizedDiff = diff / stdDev;

  let grade: PickGradeResult["grade"];
  let description: string;
  let valueScore: number;
  let commentary: string;

  if (normalizedDiff <= -3) {
    grade = "A+";
    valueScore = 98;
    description = `Elite steal — taken ${Math.round(Math.abs(diff))} spots early.`;
    commentary = `${teamName} gets tremendous value, grabbing ${playerName} well ahead of consensus.`;
  } else if (normalizedDiff <= -2) {
    grade = "A";
    valueScore = 92;
    description = `Great value — ECR was ${Math.round(ecr)}, taken at ${overallPick}.`;
    commentary = `Excellent pick by ${teamName} — ${playerName} falls further than expected.`;
  } else if (normalizedDiff <= -1) {
    grade = "A-";
    valueScore = 87;
    description = `Good value pick, slightly ahead of consensus.`;
    commentary = `${teamName} is happy with this one — solid value on ${playerName}.`;
  } else if (normalizedDiff <= 0.5) {
    grade = "B+";
    valueScore = 80;
    description = `At consensus value. ECR: ${Math.round(ecr)}.`;
    commentary = `${teamName} takes ${playerName} right at market value — no complaints.`;
  } else if (normalizedDiff <= 1) {
    grade = "B";
    valueScore = 72;
    description = `Fair pick, near consensus range.`;
    commentary = `${teamName} reaches slightly for ${playerName} but stays within range.`;
  } else if (normalizedDiff <= 1.5) {
    grade = "B-";
    valueScore = 65;
    description = `Slight reach — ${Math.round(diff)} spots above ECR.`;
    commentary = `${teamName} may have reached a bit for ${playerName}.`;
  } else if (normalizedDiff <= 2.5) {
    grade = "C+";
    valueScore = 55;
    description = `Noticeable reach — ${Math.round(diff)} spots above consensus.`;
    commentary = `${teamName} clearly values ${playerName} more than the market does.`;
  } else if (normalizedDiff <= 3.5) {
    grade = "C";
    valueScore = 42;
    description = `Significant reach — taken ${Math.round(diff)} spots above ECR.`;
    commentary = `Questionable value here — ${playerName} taken well ahead of their ECR.`;
  } else if (normalizedDiff <= 5) {
    grade = "D";
    valueScore = 28;
    description = `Major reach — ${Math.round(diff)} spots above ECR ${Math.round(ecr)}.`;
    commentary = `${teamName} really wants ${playerName} — paying a steep price in draft capital.`;
  } else {
    grade = "F";
    valueScore = 10;
    description = `Extreme reach — ${Math.round(diff)} spots above consensus ECR.`;
    commentary = `This pick will raise eyebrows — ${playerName} taken drastically ahead of rankings.`;
  }

  return {
    grade,
    description,
    valueScore,
    ecr,
    pickNumber: overallPick,
    diff,
    commentary,
  };
}

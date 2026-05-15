// ─── Value Above Replacement (VAR) Model — fully dynamic ────────────────────

export interface LeagueConfig {
  numTeams: number;
  rosterPositions: string[];
  scoringSettings: Record<string, number>;
}

function sc(scoring: Record<string, number>, key: string): number {
  const val = scoring[key];
  return val != null && val !== 0 ? val : 0;
}

export function countStarters(
  rosterPositions: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const pos of rosterPositions) {
    if (["BN", "IR", "TAXI"].includes(pos)) continue;
    counts[pos] = (counts[pos] ?? 0) + 1;
  }
  return counts;
}

const FLEX_ELIGIBLE: Record<string, string[]> = {
  FLEX: ["RB", "WR", "TE"],
  SUPER_FLEX: ["QB", "RB", "WR", "TE"],
  IDP_FLEX: ["DL", "LB", "DB"],
  REC_FLEX: ["WR", "TE"],
  WRRB_FLEX: ["WR", "RB"],
};

export function calcReplacementLevels(
  config: LeagueConfig,
): Record<string, number> {
  const starters = countStarters(config.rosterPositions);
  const n = config.numTeams;

  const effective: Record<string, number> = {};
  for (const [pos, count] of Object.entries(starters)) {
    if (FLEX_ELIGIBLE[pos]) continue;
    effective[pos] = (effective[pos] ?? 0) + count;
  }

  for (const [flexPos, count] of Object.entries(starters)) {
    const eligible = FLEX_ELIGIBLE[flexPos];
    if (!eligible) continue;
    const perPos = count / eligible.length;
    for (const pos of eligible) {
      effective[pos] = (effective[pos] ?? 0) + perPos;
    }
  }

  const levels: Record<string, number> = {};
  for (const [pos, count] of Object.entries(effective)) {
    levels[pos] = Math.ceil(count * n) + 1;
  }
  return levels;
}

// ── Historical rookie stat distributions by positional rank ──────────────────
function rbStats(rank: number) {
  const d = Math.exp(-0.07 * (rank - 1));
  return {
    rushYds: 900 * d,
    rushTDs: 7 * d,
    rushFDs: 45 * d,
    rec: 40 * d,
    recYds: 300 * d,
    recTDs: 2 * d,
    recFDs: 20 * d,
    fumLost: 2 * d,
  };
}

function wrStats(rank: number) {
  const d = Math.exp(-0.07 * (rank - 1));
  return {
    rec: 55 * d,
    recYds: 750 * d,
    recTDs: 5 * d,
    recFDs: 35 * d,
    rushYds: 20 * d,
    fumLost: 1 * d,
  };
}

function teStats(rank: number) {
  const d = Math.exp(-0.08 * (rank - 1));
  return {
    rec: 45 * d,
    recYds: 520 * d,
    recTDs: 4 * d,
    recFDs: 25 * d,
    fumLost: 0.5 * d,
  };
}

function qbStats(rank: number) {
  const d = Math.exp(-0.08 * (rank - 1));
  return {
    passYds: 3800 * d,
    passTDs: 24 * d,
    passINTs: 12 * d,
    rushYds: 350 * d,
    rushTDs: 3 * d,
    rushFDs: 30 * d,
    fumLost: 3 * d,
  };
}

function kStats(rank: number) {
  const d = Math.exp(-0.1 * (rank - 1));
  return {
    fgm20: 2 * d,
    fgm30: 5 * d,
    fgm40: 4 * d,
    fgm50: 2 * d,
    xpm: 35 * d,
    xpmiss: 1 * d,
  };
}

function dlStats(rank: number) {
  const d = Math.exp(-0.08 * (rank - 1));
  return {
    soloTkl: 28 * d,
    astTkl: 18 * d,
    sacks: 5 * d,
    tfl: 8 * d,
    qbHits: 12 * d,
    ff: 2 * d,
    fr: 1 * d,
    defTDs: 0.3 * d,
    sack2pBonus: 2 * d,
  };
}

function lbStats(rank: number) {
  const d = Math.exp(-0.07 * (rank - 1));
  return {
    soloTkl: 60 * d,
    astTkl: 30 * d,
    sacks: 2 * d,
    tfl: 5 * d,
    qbHits: 4 * d,
    ints: 1.5 * d,
    passDefend: 5 * d,
    ff: 1.5 * d,
    fr: 1 * d,
    defTDs: 0.4 * d,
    tkl10pBonus: 4 * d,
  };
}

function dbStats(rank: number) {
  const d = Math.exp(-0.08 * (rank - 1));
  return {
    soloTkl: 50 * d,
    astTkl: 20 * d,
    ints: 3 * d,
    passDefend: 10 * d,
    tfl: 2 * d,
    ff: 1 * d,
    fr: 0.8 * d,
    defTDs: 0.5 * d,
    sacks: 0.5 * d,
    tkl10pBonus: 2 * d,
  };
}

function calcPoints(
  pos: string,
  rank: number,
  scoring: Record<string, number>,
): number {
  let pts = 0;

  if (pos === "QB") {
    const st = qbStats(rank);
    pts += st.passYds * sc(scoring, "pass_yd");
    pts += st.passTDs * sc(scoring, "pass_td");
    pts += st.passINTs * sc(scoring, "pass_int");
    pts += st.rushYds * sc(scoring, "rush_yd");
    pts += st.rushTDs * sc(scoring, "rush_td");
    pts += st.rushFDs * sc(scoring, "rush_fd");
    pts += st.fumLost * sc(scoring, "fum_lost");
  } else if (pos === "RB") {
    const st = rbStats(rank);
    pts += st.rushYds * sc(scoring, "rush_yd");
    pts += st.rushTDs * sc(scoring, "rush_td");
    pts += st.rushFDs * sc(scoring, "rush_fd");
    pts += st.rec * sc(scoring, "rec");
    pts += st.recYds * sc(scoring, "rec_yd");
    pts += st.recTDs * sc(scoring, "rec_td");
    pts += st.recFDs * sc(scoring, "rec_fd");
    pts += st.fumLost * sc(scoring, "fum_lost");
  } else if (pos === "WR") {
    const st = wrStats(rank);
    pts += st.rec * sc(scoring, "rec");
    pts += st.recYds * sc(scoring, "rec_yd");
    pts += st.recTDs * sc(scoring, "rec_td");
    pts += st.recFDs * sc(scoring, "rec_fd");
    pts += st.rushYds * sc(scoring, "rush_yd");
    pts += st.fumLost * sc(scoring, "fum_lost");
  } else if (pos === "TE") {
    const st = teStats(rank);
    pts += st.rec * sc(scoring, "rec");
    pts += st.rec * sc(scoring, "bonus_rec_te");
    pts += st.recYds * sc(scoring, "rec_yd");
    pts += st.recTDs * sc(scoring, "rec_td");
    pts += st.recFDs * sc(scoring, "rec_fd");
    pts += st.fumLost * sc(scoring, "fum_lost");
  } else if (pos === "K") {
    const st = kStats(rank);
    pts += st.fgm20 * sc(scoring, "fgm_20_29");
    pts += st.fgm30 * sc(scoring, "fgm_30_39");
    pts += st.fgm40 * sc(scoring, "fgm_40_49");
    pts += st.fgm50 * sc(scoring, "fgm_50p");
    pts += st.xpm * sc(scoring, "xpm");
    pts += st.xpmiss * sc(scoring, "xpmiss");
  } else if (pos === "DL") {
    const st = dlStats(rank);
    pts += st.soloTkl * sc(scoring, "idp_tkl_solo");
    pts += st.astTkl * sc(scoring, "idp_tkl_ast");
    pts += st.sacks * sc(scoring, "idp_sack");
    pts += st.tfl * sc(scoring, "idp_tkl_loss");
    pts += st.qbHits * sc(scoring, "idp_qb_hit");
    pts += st.ff * sc(scoring, "idp_ff");
    pts += st.fr * sc(scoring, "idp_fum_rec");
    pts += st.defTDs * sc(scoring, "idp_def_td");
    pts += st.sack2pBonus * sc(scoring, "bonus_sack_2p");
  } else if (pos === "LB") {
    const st = lbStats(rank);
    pts += st.soloTkl * sc(scoring, "idp_tkl_solo");
    pts += st.astTkl * sc(scoring, "idp_tkl_ast");
    pts += st.sacks * sc(scoring, "idp_sack");
    pts += st.tfl * sc(scoring, "idp_tkl_loss");
    pts += st.qbHits * sc(scoring, "idp_qb_hit");
    pts += st.ints * sc(scoring, "idp_int");
    pts += st.passDefend * sc(scoring, "idp_pass_def");
    pts += st.ff * sc(scoring, "idp_ff");
    pts += st.fr * sc(scoring, "idp_fum_rec");
    pts += st.defTDs * sc(scoring, "idp_def_td");
    pts += st.tkl10pBonus * sc(scoring, "bonus_tkl_10p");
  } else if (pos === "DB") {
    const st = dbStats(rank);
    pts += st.soloTkl * sc(scoring, "idp_tkl_solo");
    pts += st.astTkl * sc(scoring, "idp_tkl_ast");
    pts += st.ints * sc(scoring, "idp_int");
    pts += st.passDefend * sc(scoring, "idp_pass_def");
    pts += st.tfl * sc(scoring, "idp_tkl_loss");
    pts += st.ff * sc(scoring, "idp_ff");
    pts += st.fr * sc(scoring, "idp_fum_rec");
    pts += st.defTDs * sc(scoring, "idp_def_td");
    pts += st.sacks * sc(scoring, "idp_sack");
    pts += st.tkl10pBonus * sc(scoring, "bonus_tkl_10p");
  }

  return Math.round(pts);
}

export function normalizePosition(raw: string): string {
  const base = raw.replace(/\d+$/, "").toUpperCase();
  if (["EDGE", "DE", "DT"].includes(base)) return "DL";
  if (["S", "CB", "FS", "SS"].includes(base)) return "DB";
  if (["QB", "RB", "WR", "TE", "K", "DL", "LB", "DB"].includes(base))
    return base;
  return base;
}

export interface VARResult {
  grade: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "F";
  description: string;
  commentary: string;
  valueScore: number;
  var: number;
  projectedPts: number;
  replacementPts: number;
  replacementRank: number;
  position: string;
}

export function calculateVAR(
  playerName: string,
  positionalRank: number,
  rawPosition: string,
  overallPickNumber: number,
  teamName: string,
  config: LeagueConfig,
): VARResult {
  const pos = normalizePosition(rawPosition);
  const replLevels = calcReplacementLevels(config);
  const replRank = replLevels[pos] ?? 19;

  const projectedPts = calcPoints(pos, positionalRank, config.scoringSettings);
  const replacementPts = calcPoints(pos, replRank, config.scoringSettings);
  const varValue = projectedPts - replacementPts;

  const allPos = ["QB", "RB", "WR", "TE", "K", "DL", "LB", "DB"];
  let maxVAR = 0;
  for (const p of allPos) {
    const rr = replLevels[p] ?? 19;
    const v =
      calcPoints(p, 1, config.scoringSettings) -
      calcPoints(p, rr, config.scoringSettings);
    if (v > maxVAR) maxVAR = v;
  }

  const valueScore =
    maxVAR > 0
      ? Math.min(100, Math.max(0, Math.round((varValue / maxVAR) * 100)))
      : 50;

  let grade: VARResult["grade"];
  let description: string;
  let commentary: string;

  if (valueScore >= 88) {
    grade = "A+";
    description = `Elite value — +${varValue} pts above replacement.`;
    commentary = `${teamName} lands a difference-maker. ${playerName} projects ${varValue} pts above replacement at ${pos}.`;
  } else if (valueScore >= 76) {
    grade = "A";
    description = `Strong value — +${varValue} pts above replacement.`;
    commentary = `Excellent pick by ${teamName}. ${playerName} has real starter upside in this format.`;
  } else if (valueScore >= 64) {
    grade = "A-";
    description = `Good value. Solid ${pos} dynasty asset.`;
    commentary = `${teamName} adds a quality ${pos} with ${playerName}.`;
  } else if (valueScore >= 52) {
    grade = "B+";
    description = `Above average value at ${pos}.`;
    commentary = `${playerName} projects as a solid contributor for ${teamName}.`;
  } else if (valueScore >= 40) {
    grade = "B";
    description = `Fair value pick at ${pos}.`;
    commentary = `Reasonable selection — ${playerName} near the starter threshold for ${teamName}.`;
  } else if (valueScore >= 30) {
    grade = "B-";
    description = `Slightly below average positional value.`;
    commentary = `${teamName} adds depth at ${pos} with ${playerName}.`;
  } else if (valueScore >= 20) {
    grade = "C+";
    description = `Below average value — limited upside at ${pos}.`;
    commentary = `Questionable positional value here for ${teamName}.`;
  } else if (valueScore >= 12) {
    grade = "C";
    description = `Low value — near replacement level at ${pos}.`;
    commentary = `${playerName} may struggle to contribute above replacement for ${teamName}.`;
  } else if (valueScore >= 5) {
    grade = "D";
    description = `Poor value — below replacement projection at ${pos}.`;
    commentary = `Tough pick to grade — ${playerName} projects below replacement for ${teamName}.`;
  } else {
    grade = "F";
    description = `Very poor value — significantly below replacement.`;
    commentary = `This pick may hurt ${teamName}'s roster construction at ${pos}.`;
  }

  return {
    grade,
    description,
    commentary,
    valueScore,
    var: varValue,
    projectedPts,
    replacementPts,
    replacementRank: replRank,
    position: pos,
  };
}

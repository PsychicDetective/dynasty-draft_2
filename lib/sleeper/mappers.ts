// ─── Map raw Sleeper data → app DraftState ────────────────────────────────────

import type {
  SleeperLeague,
  SleeperUser,
  SleeperRoster,
  SleeperDraft,
  SleeperPick,
  SleeperTradedPick,
  SleeperPlayer,
} from "@/types/sleeper";
import type {
  DraftState,
  DraftTeam,
  DraftPick,
  DraftPlayer,
  AvailablePlayer,
  Position,
  RosterPlayer,
} from "@/types/draft";
import { avatarUrl } from "./api";

// Positions we care about for dynasty
const DYNASTY_POSITIONS: Position[] = [
  "QB",
  "RB",
  "WR",
  "TE",
  "K",
  "DB,WR",
  "DB,LB",
  "DB",
  "LB",
  "LB,DL",
  "DL,LB",
  "DL",
  "DEF",
];
function toPosition(raw: string): Position {
  const VALID: Position[] = [
    "QB",
    "RB",
    "WR",
    "TE",
    "K",
    "DEF",
    "FLEX",
    "SF",
    "DL",
    "LB",
    "LB,DL",
    "DB",
    "DB,LB",
    "DB,WR",
  ];
  if (VALID.includes(raw as Position)) return raw as Position;
  // Handle unknown combos — return as-is cast
  return raw as Position;
}

function mapPlayer(
  pick: SleeperPick,
  playerDb: Record<string, SleeperPlayer>,
): DraftPlayer | null {
  const meta = pick.metadata;
  if (!meta?.player_id) return null;
  const p = playerDb[meta.player_id];
  return {
    playerId: meta.player_id,
    firstName: meta.first_name,
    lastName: meta.last_name,
    fullName: `${meta.first_name} ${meta.last_name}`,
    position: toPosition(meta.position),
    nflTeam: meta.team ?? "FA",
    college: p?.college ?? "Unknown",
    age: p?.age ?? null,
    yearsExp: p?.years_exp ?? null,
    injuryStatus: meta.injury_status ?? null,
  };
}

function inferNeeds(
  roster: SleeperRoster,
  playerDb: Record<string, SleeperPlayer>,
): Position[] {
  const players = roster.players ?? [];
  const positions = players
    .map((id) => playerDb[id]?.position)
    .filter(Boolean) as string[];
  const counts: Record<string, number> = {};
  positions.forEach((p) => (counts[p] = (counts[p] ?? 0) + 1));
  // Rough dynasty need heuristic
  const needs: Position[] = [];
  if ((counts["WR"] ?? 0) < 4) needs.push("WR");
  if ((counts["RB"] ?? 0) < 3) needs.push("RB");
  if ((counts["QB"] ?? 0) < 2) needs.push("QB");
  if ((counts["TE"] ?? 0) < 2) needs.push("TE");
  if ((counts["DB"] ?? 0) < 5) needs.push("DB");
  if ((counts["LB"] ?? 0) < 4) needs.push("LB");
  if ((counts["DL"] ?? 0) < 4) needs.push("DL");
  return needs.slice(0, 4);
}

function mapRosterPlayers(
  roster: SleeperRoster,
  playerDb: Record<string, SleeperPlayer>,
): RosterPlayer[] {
  return (roster.players ?? [])
    .map((id) => {
      const p = playerDb[id];
      if (!p) return null;
      // Use fantasy_positions joined — e.g. ["LB", "DL"] → "LB,DL"
      const position = p.fantasy_positions?.length
        ? (p.fantasy_positions.join(",") as Position)
        : ((p.position ?? "RB") as Position);
      return {
        playerId: id,
        fullName: p.full_name ?? `${p.first_name} ${p.last_name}`,
        position,
        nflTeam: p.team ?? "FA",
      } satisfies RosterPlayer;
    })
    .filter((p): p is RosterPlayer => p !== null)
    .slice(0, 50);
}

export function buildDraftState(
  league: SleeperLeague,
  users: SleeperUser[],
  rosters: SleeperRoster[],
  draft: SleeperDraft,
  picks: SleeperPick[],
  tradedPicks: SleeperTradedPick[],
  playerDb: Record<string, SleeperPlayer>,
): DraftState {
  const userMap = new Map(users.map((u) => [u.user_id, u]));
  const rosterByOwnerId = new Map(rosters.map((r) => [r.owner_id, r]));
  const rosterById = new Map(rosters.map((r) => [r.roster_id, r]));

  // Build team map
  const teams: DraftTeam[] = users.map((user) => {
    const roster = rosterByOwnerId.get(user.user_id);
    const teamName = (user as any).metadata?.team_name || user.display_name;
    return {
      rosterId: roster?.roster_id ?? 0,
      userId: user.user_id,
      teamName: teamName,
      ownerName: user.display_name,
      avatar: user.avatar
        ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
        : null,
      picks: [],
      needs: roster ? inferNeeds(roster, playerDb) : [],
      rosterPlayers: roster ? mapRosterPlayers(roster, playerDb) : [],
      remainingPickSlots: [],
    };
  });

  const teamByRosterId = new Map(teams.map((t) => [t.rosterId, t]));
  const totalPicks = draft.settings.rounds * rosters.length;
  const completedPickNos = new Set(picks.map((p) => p.pick_no));

  // Figure out current overall pick number
  const lastPickNo =
    picks.length > 0 ? Math.max(...picks.map((p) => p.pick_no)) : 0;
  const currentPickNumber = lastPickNo + 1;

  // Build all pick slots (snake draft aware)
  const allPicks: DraftPick[] = [];
  for (let overall = 1; overall <= totalPicks; overall++) {
    const round = Math.ceil(overall / rosters.length);
    const pickInRound = ((overall - 1) % rosters.length) + 1;

    // For snake: odd rounds go 1→N, even rounds go N→1
    const slotInRound =
      draft.type === "snake" && round % 2 === 0
        ? rosters.length - pickInRound + 1
        : pickInRound;

    const rosterId =
      draft.slot_to_roster_id?.[String(slotInRound)] ?? slotInRound;
    const rawPick = picks.find((p) => p.pick_no === overall);
    const team = teamByRosterId.get(rosterId) ?? null;

    // Check if pick was traded
    const traded = tradedPicks.find(
      (tp) => tp.round === round && tp.roster_id === rosterId,
    );
    const effectiveRosterId = traded ? traded.owner_id : rosterId;
    const effectiveTeam = teamByRosterId.get(effectiveRosterId) ?? team;

    const status =
      overall < currentPickNumber
        ? "complete"
        : overall === currentPickNumber
          ? "current"
          : "upcoming";

    const draftPick: DraftPick = {
      round,
      pickInRound,
      overallPick: overall,
      rosterId: effectiveRosterId,
      team: effectiveTeam
        ? (() => {
            const { picks: _o, ...t } = effectiveTeam as any;
            return t;
          })()
        : null,
      player: rawPick ? mapPlayer(rawPick, playerDb) : null,
      status,
      isKeeper: rawPick?.is_keeper ?? false,
      isTradedPick: !!traded,
    };

    allPicks.push(draftPick);
  }

  // Remaining pick slots per team
  // After allPicks is built, assign remainingPickSlots to each team
  teams.forEach((team) => {
    team.remainingPickSlots = allPicks
      .filter((p) => p.rosterId === team.rosterId && p.status !== "complete")
      .map((p) => `${p.round}.${String(p.pickInRound).padStart(2, "0")}`);
  });

  // Build available players (not yet drafted)
  const draftedIds = new Set(picks.map((p) => p.player_id));
  // Filter player pool based on draft type set in Sleeper
  // draft.settings.player_type: 0 = all, 1 = rookies only, 2 = veterans only
  // dynasty rookie drafts: type=2 in Sleeper means dynasty,
  // and rookie_only is set separately
  const playerType =
    (draft.settings as any).player_type ??
    ((draft as any).type === "dynasty" ? 1 : 0);

  const availablePlayers: AvailablePlayer[] = Object.values(playerDb)
    .filter((p) => {
      if (!DYNASTY_POSITIONS.includes(toPosition(p.position))) return false;
      if (draftedIds.has(p.player_id)) return false;
      if (p.search_rank == null) return false;
      // Rookies = 0 years experience
      if (playerType === 1 && (p.years_exp ?? 0) !== 0) return false;
      // Veterans = at least 1 year experience
      if (playerType === 2 && (p.years_exp ?? 0) === 0) return false;
      return true;
    })
    .sort((a, b) => (a.search_rank ?? 999) - (b.search_rank ?? 999))
    .slice(0, 200)
    .map((p, i) => ({
      playerId: p.player_id,
      fullName: p.full_name ?? `${p.first_name} ${p.last_name}`,
      position: toPosition(p.position),
      nflTeam: p.team ?? "FA",
      college: p.college ?? "Unknown",
      adp: p.search_rank,
      tier: i < 12 ? 1 : i < 36 ? 2 : i < 72 ? 3 : 4,
      age: p.age ?? null,
    }));

  return {
    leagueId: league.league_id,
    leagueName: league.name,
    draftId: draft.draft_id,
    status: draft.status,
    currentPickNumber,
    totalRounds: draft.settings.rounds,
    totalTeams: rosters.length,
    pickTimer: draft.settings.pick_timer ?? 120,
    teams: teams.map(({ picks: _omit, ...t }) => t) as any,
    allPicks,
    availablePlayers,
    lastUpdated: Date.now(),
    lastPicked: draft.last_picked ?? 0,
    scoringSettings: league.scoring_settings ?? {},
    rosterPositions: league.roster_positions ?? [],
  };
}

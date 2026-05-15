import { NextRequest, NextResponse } from "next/server";
import type { DraftState, DraftPick, AvailablePlayer } from "@/types/draft";

const ALL_PLAYERS = [
  {
    playerId: "p1",
    fullName: "Marvin Harrison Jr.",
    position: "WR" as const,
    nflTeam: "ARI",
    college: "Ohio State",
    age: 22,
  },
  {
    playerId: "p2",
    fullName: "Jayden Daniels",
    position: "QB" as const,
    nflTeam: "WAS",
    college: "LSU",
    age: 23,
  },
  {
    playerId: "p3",
    fullName: "Rome Odunze",
    position: "WR" as const,
    nflTeam: "CHI",
    college: "Washington",
    age: 22,
  },
  {
    playerId: "p4",
    fullName: "Brock Bowers",
    position: "TE" as const,
    nflTeam: "LVR",
    college: "Georgia",
    age: 21,
  },
  {
    playerId: "p5",
    fullName: "Malik Nabers",
    position: "WR" as const,
    nflTeam: "NYG",
    college: "LSU",
    age: 21,
  },
  {
    playerId: "p6",
    fullName: "Brian Thomas Jr.",
    position: "WR" as const,
    nflTeam: "JAX",
    college: "LSU",
    age: 22,
  },
  {
    playerId: "p7",
    fullName: "Ollie Gordon II",
    position: "RB" as const,
    nflTeam: "TEN",
    college: "Oklahoma St.",
    age: 21,
  },
  {
    playerId: "p8",
    fullName: "Jonathon Brooks",
    position: "RB" as const,
    nflTeam: "CAR",
    college: "Texas",
    age: 21,
  },
  {
    playerId: "p9",
    fullName: "Ladd McConkey",
    position: "WR" as const,
    nflTeam: "LAC",
    college: "Georgia",
    age: 22,
  },
  {
    playerId: "p10",
    fullName: "Troy Franklin",
    position: "WR" as const,
    nflTeam: "DEN",
    college: "Oregon",
    age: 21,
  },
  {
    playerId: "p11",
    fullName: "Trey Benson",
    position: "RB" as const,
    nflTeam: "ARI",
    college: "Florida St.",
    age: 22,
  },
  {
    playerId: "p12",
    fullName: "Bo Nix",
    position: "QB" as const,
    nflTeam: "DEN",
    college: "Oregon",
    age: 24,
  },
  {
    playerId: "p13",
    fullName: "Ricky Pearsall",
    position: "WR" as const,
    nflTeam: "SFO",
    college: "Florida",
    age: 23,
  },
  {
    playerId: "p14",
    fullName: "Xavier Worthy",
    position: "WR" as const,
    nflTeam: "KCC",
    college: "Texas",
    age: 21,
  },
  {
    playerId: "p15",
    fullName: "Adonai Mitchell",
    position: "WR" as const,
    nflTeam: "IND",
    college: "Texas",
    age: 22,
  },
  {
    playerId: "p16",
    fullName: "Keon Coleman",
    position: "WR" as const,
    nflTeam: "BUF",
    college: "Florida St.",
    age: 21,
  },
  {
    playerId: "p17",
    fullName: "Blake Corum",
    position: "RB" as const,
    nflTeam: "LAR",
    college: "Michigan",
    age: 22,
  },
  {
    playerId: "p18",
    fullName: "Michael Penix Jr.",
    position: "QB" as const,
    nflTeam: "ATL",
    college: "Washington",
    age: 24,
  },
  {
    playerId: "p19",
    fullName: "Will Shipley",
    position: "RB" as const,
    nflTeam: "PHI",
    college: "Clemson",
    age: 21,
  },
  {
    playerId: "p20",
    fullName: "Sam LaPorta",
    position: "TE" as const,
    nflTeam: "DET",
    college: "Iowa",
    age: 23,
  },
  {
    playerId: "p21",
    fullName: "Javon Baker",
    position: "WR" as const,
    nflTeam: "NWE",
    college: "UCF",
    age: 22,
  },
  {
    playerId: "p22",
    fullName: "Marshawn Lloyd",
    position: "RB" as const,
    nflTeam: "SFO",
    college: "USC",
    age: 21,
  },
  {
    playerId: "p23",
    fullName: "Isaiah Davis",
    position: "RB" as const,
    nflTeam: "NYJ",
    college: "S. Dakota St.",
    age: 22,
  },
  {
    playerId: "p24",
    fullName: "Luke Musgrave",
    position: "TE" as const,
    nflTeam: "GBP",
    college: "Oregon St.",
    age: 23,
  },
  {
    playerId: "p25",
    fullName: "Jalen McMillan",
    position: "WR" as const,
    nflTeam: "TBB",
    college: "Washington",
    age: 22,
  },
  {
    playerId: "p26",
    fullName: "Devontez Walker",
    position: "WR" as const,
    nflTeam: "BAL",
    college: "UNC",
    age: 22,
  },
  {
    playerId: "p27",
    fullName: "Ja'Lynn Polk",
    position: "WR" as const,
    nflTeam: "NWE",
    college: "Washington",
    age: 22,
  },
  {
    playerId: "p28",
    fullName: "Kimani Vidal",
    position: "RB" as const,
    nflTeam: "LAC",
    college: "Troy",
    age: 22,
  },
  {
    playerId: "p29",
    fullName: "Ray Davis",
    position: "RB" as const,
    nflTeam: "BUF",
    college: "Kentucky",
    age: 24,
  },
  {
    playerId: "p30",
    fullName: "Braelon Allen",
    position: "RB" as const,
    nflTeam: "NYJ",
    college: "Wisconsin",
    age: 20,
  },
];

const TEAMS = [
  {
    rosterId: 1,
    userId: "u1",
    teamName: "Philadelphia Dawgs",
    ownerName: "Jordan T.",
    avatar: null,
    baseNeeds: ["WR", "RB", "QB"],
  },
  {
    rosterId: 2,
    userId: "u2",
    teamName: "Steel City Kings",
    ownerName: "Marcus D.",
    avatar: null,
    baseNeeds: ["TE", "WR", "RB"],
  },
  {
    rosterId: 3,
    userId: "u3",
    teamName: "Desert Wolves",
    ownerName: "Priya K.",
    avatar: null,
    baseNeeds: ["QB", "WR", "K"],
  },
  {
    rosterId: 4,
    userId: "u4",
    teamName: "Bay Area Blitz",
    ownerName: "Tyler M.",
    avatar: null,
    baseNeeds: ["RB", "TE", "WR"],
  },
  {
    rosterId: 5,
    userId: "u5",
    teamName: "Lone Star FC",
    ownerName: "Destiny R.",
    avatar: null,
    baseNeeds: ["WR", "QB", "RB"],
  },
  {
    rosterId: 6,
    userId: "u6",
    teamName: "Green Bay Cheeseheads",
    ownerName: "Bo H.",
    avatar: null,
    baseNeeds: ["RB", "WR", "QB"],
  },
];

const TOTAL_ROUNDS = 5;
const TOTAL_TEAMS = 6;
const TOTAL_PICKS = TOTAL_ROUNDS * TOTAL_TEAMS;

// Module-level variable — persists across requests in the same Node.js process.
// Next.js hot-reload preserves this between requests during development.
let pickCount = 0;

function rosterIdForOverall(overall: number): number {
  const round = Math.ceil(overall / TOTAL_TEAMS);
  const pickInRound = ((overall - 1) % TOTAL_TEAMS) + 1;
  const slot = round % 2 === 0 ? TOTAL_TEAMS - pickInRound + 1 : pickInRound;
  return TEAMS[slot - 1].rosterId;
}

function buildState(completed: number): DraftState {
  const draftedIds = new Set(
    Array.from(
      { length: completed },
      (_, i) => ALL_PLAYERS[i % ALL_PLAYERS.length].playerId,
    ),
  );

  const allPicks: DraftPick[] = [];

  for (let overall = 1; overall <= TOTAL_PICKS; overall++) {
    const round = Math.ceil(overall / TOTAL_TEAMS);
    const pickInRound = ((overall - 1) % TOTAL_TEAMS) + 1;
    const rosterId = rosterIdForOverall(overall);

    const status: DraftPick["status"] =
      overall <= completed
        ? "complete"
        : overall === completed + 1
          ? "current"
          : "upcoming";

    const playerData =
      overall <= completed
        ? ALL_PLAYERS[(overall - 1) % ALL_PLAYERS.length]
        : null;

    allPicks.push({
      round,
      pickInRound,
      overallPick: overall,
      rosterId,
      team: null as any,
      player: playerData
        ? {
            ...playerData,
            firstName: playerData.fullName.split(" ")[0],
            lastName: playerData.fullName.split(" ").slice(1).join(" "),
            yearsExp: 0,
            injuryStatus: null,
          }
        : null,
      status,
      isKeeper: false,
      isTradedPick: false,
    });
  }

  const teams = TEAMS.map((base) => {
    const myPicks = allPicks.filter((p) => p.rosterId === base.rosterId);
    const rosterPlayers = myPicks
      .filter((p) => p.status === "complete" && p.player)
      .map((p) => ({
        playerId: p.player!.playerId,
        fullName: p.player!.fullName,
        position: p.player!.position,
        nflTeam: p.player!.nflTeam,
      }));
    const remainingPickSlots = myPicks
      .filter((p) => p.status !== "complete")
      .map((p) => `${p.round}.${String(p.pickInRound).padStart(2, "0")}`);
    return {
      ...base,
      picks: myPicks,
      rosterPlayers,
      remainingPickSlots,
      needs: base.baseNeeds as any,
    };
  });

  const teamMap = new Map(teams.map((t) => [t.rosterId, t]));
  allPicks.forEach((p) => {
    const team = teamMap.get(p.rosterId);
    if (team) {
      const { picks: _omit, ...teamWithoutPicks } = team as any;
      p.team = teamWithoutPicks;
    }
  });
  const available: AvailablePlayer[] = ALL_PLAYERS.filter(
    (p) => !draftedIds.has(p.playerId),
  ).map((p, i) => ({
    ...p,
    adp: completed + i + 1,
    tier: (i < 3 ? 1 : i < 8 ? 2 : i < 15 ? 3 : 4) as 1 | 2 | 3 | 4,
  }));

  return {
    leagueId: "mock-league",
    leagueName: "Dynasty League (Simulator)",
    draftId: "mock-draft",
    status: "drafting",
    currentPickNumber: Math.min(completed + 1, TOTAL_PICKS),
    totalRounds: TOTAL_ROUNDS,
    totalTeams: TOTAL_TEAMS,
    pickTimer: 90,
    teams: teams.map(({ picks: _omit, ...t }) => t),
    allPicks,
    availablePlayers: available,
    lastUpdated: Date.now(),
  };
}

export async function GET(req: NextRequest) {
  const pickParam = req.nextUrl.searchParams.get("pick");
  if (pickParam !== null) {
    pickCount = Math.max(0, Math.min(TOTAL_PICKS, parseInt(pickParam, 10)));
  }
  return NextResponse.json(buildState(pickCount), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body.pick === "number") {
      pickCount = Math.max(0, Math.min(TOTAL_PICKS, body.pick));
    } else {
      pickCount = Math.min(pickCount + 1, TOTAL_PICKS);
    }
  } catch {
    pickCount = Math.min(pickCount + 1, TOTAL_PICKS);
  }
  return NextResponse.json(buildState(pickCount), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function DELETE() {
  pickCount = 0;
  return NextResponse.json({ reset: true, pick: 0 });
}

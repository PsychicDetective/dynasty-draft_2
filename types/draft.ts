// ─── App-level draft types (mapped from Sleeper raw data) ─────────────────────

export type Position =
  | "QB"
  | "RB"
  | "WR"
  | "TE"
  | "K"
  | "DEF"
  | "FLEX"
  | "SF"
  | "DL"
  | "LB"
  | "LB,DL"
  | "DL,LB"
  | "DB"
  | "DB,LB"
  | "DB,WR";

export type DraftRevealState =
  | "WAITING_FOR_PICK"
  | "PICK_IS_IN"
  | "ANNOUNCING_PICK"
  | "REVEALING_PICK"
  | "PLAYING_HIGHLIGHT"
  | "READY_FOR_NEXT_PICK";

export interface DraftTeam {
  rosterId: number;
  userId: string;
  teamName: string;
  ownerName: string;
  avatar: string | null;
  picks?: DraftPick[];
  needs: Position[];
  rosterPlayers: RosterPlayer[];
  remainingPickSlots: string[];
}

export interface DraftPick {
  round: number;
  pickInRound: number;
  overallPick: number;
  rosterId: number;
  team: DraftTeam | null;
  player: DraftPlayer | null;
  status: "complete" | "current" | "upcoming";
  grade?: PickGrade;
  isKeeper: boolean;
  isTradedPick: boolean;
}

export interface DraftPlayer {
  playerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: Position;
  nflTeam: string;
  college: string;
  age: number | null;
  yearsExp: number | null;
  injuryStatus: string | null;
}

export interface RosterPlayer {
  playerId: string;
  fullName: string;
  position: Position;
  nflTeam: string;
}

export interface PickGrade {
  grade: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "F";
  description: string;
  valueScore: number;
}

export interface DraftState {
  leagueId: string;
  leagueName: string;
  draftId: string;
  status: "pre_draft" | "drafting" | "complete" | "paused";
  currentPickNumber: number;
  totalRounds: number;
  totalTeams: number;
  pickTimer: number;
  teams: DraftTeam[];
  allPicks: DraftPick[];
  availablePlayers: AvailablePlayer[];
  lastUpdated: number;
  lastPicked: number;
  scoringSettings: Record<string, number>;
  rosterPositions: string[];
}

export interface AvailablePlayer {
  playerId: string;
  fullName: string;
  position: Position;
  nflTeam: string;
  college: string;
  adp: number | null;
  tier: 1 | 2 | 3 | 4;
  age: number | null;
}

export interface AnnouncementPayload {
  pick: DraftPick;
  videoId?: string | null;
  grade?: PickGrade;
  commentary?: string;
  voiceName?: string | null;
  language?: string;
  ecr?: number | null;
  diff?: number | null;
  var?: number | null;
  projectedPts?: number | null;
  replacementPts?: number | null;
  scoringSettings?: Record<string, number>;
  rosterPositions?: string[];
  numTeams?: number;
}

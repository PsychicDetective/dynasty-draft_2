// ─── Raw Sleeper API types ────────────────────────────────────────────────────

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  metadata?: {
    team_name?: string;
    team_name_update?: string;
  };
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: "pre_draft" | "drafting" | "in_season" | "complete";
  total_rosters: number;
  roster_positions: string[];
  settings: {
    draft_rounds: number;
    pick_timer: number; // seconds
  };
  scoring_settings: Record<string, number>;
  draft_id: string;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  players: string[] | null;      // player_ids
  starters: string[] | null;
  reserve: string[] | null;
  co_owners: string[] | null;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
  };
}

export interface SleeperDraft {
  draft_id: string;
  league_id: string;
  type: "snake" | "linear" | "auction";
  status: "pre_draft" | "drafting" | "complete" | "paused";
  sport: "nfl";
  season: string;
  season_type: "regular";
  settings: {
    rounds: number;
    pick_timer: number;
    slots_wr: number;
    slots_rb: number;
    slots_qb: number;
    slots_te: number;
    slots_flex: number;
    slots_super_flex: number;
    slots_k: number;
    slots_bn: number;
  };
  draft_order: Record<string, number> | null; // user_id -> pick slot
  slot_to_roster_id: Record<string, number>;  // slot -> roster_id
  start_time: number;
  last_picked: number;                        // epoch ms
  last_message_time: number;
}

export interface SleeperPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;       // roster_id of team that owns the pick (trade-aware)
  pick_no: number;         // overall pick number
  metadata: {
    player_id: string;
    first_name: string;
    last_name: string;
    position: string;
    team: string;
    slot: string;
    status: string;
    sport: string;
    years_exp: string;
    injury_status: string | null;
    number: string;
  };
  is_keeper: boolean | null;
  draft_id: string;
  draft_slot: number;
}

export interface SleeperTradedPick {
  season: string;
  round: number;
  roster_id: number;       // original owner
  previous_owner_id: number;
  owner_id: number;        // current owner
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  position: "QB" | "RB" | "WR" | "TE" | "K" | "DEF" | "DL" | "LB" | "DB";
  team: string | null;
  college: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  years_exp: number | null;
  status: "Active" | "Injured Reserve" | "PUP" | "Inactive" | null;
  injury_status: string | null;
  fantasy_positions: string[];
  search_rank: number | null;
  sport: "nfl";
}

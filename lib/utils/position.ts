const POSITION_MAP: Record<string, string> = {
  QB:   "quarterback",
  RB:   "running back",
  WR:   "wide receiver",
  TE:   "tight end",
  K:    "kicker",
  DEF:  "defense",
  OL:   "offensive lineman",
  DL:   "defensive lineman",
  LB:   "linebacker",
  DB:   "defensive back",
  CB:   "cornerback",
  S:    "safety",
  FLEX: "flex",
  SF:   "super flex",
};

export function fullPosition(abbr: string): string {
  return POSITION_MAP[abbr.toUpperCase()] ?? abbr.toLowerCase();
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function buildAnnouncementText(
  overallPick: number,
  year: string | number,
  teamName: string,
  playerName: string,
  position: string,
  college: string
): string {
  return (
    `With the ${ordinal(overallPick)} pick in the ${year} NFL Draft, ` +
    `the ${teamName} select ${playerName}, ` +
    `${fullPosition(position)}, ${college}.`
  );
}
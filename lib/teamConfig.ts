// eslint-disable-next-line @typescript-eslint/no-require-imports
const raw = require("@/data/team-config.json") as Record<string, {
  teamName?: string;
  soundFile?: string | null;
  voiceName?: string | null;
  language?: string | null;
}>;

const DEFAULT_SOUND = "draft-chime.mp3";

export interface TeamConfig {
  teamName: string;
  soundFile: string;
  voiceName: string | null;
  language: string;
}

export function getTeamConfig(rosterId: number): TeamConfig {
  const config = raw[String(rosterId)];
  return {
    teamName: config?.teamName ?? "Unknown",
    soundFile: config?.soundFile ?? DEFAULT_SOUND,
    voiceName: config?.voiceName ?? null,
    language: config?.language ?? "en",
  };
}
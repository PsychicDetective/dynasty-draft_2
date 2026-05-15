import fs from "fs";
import path from "path";

export interface VideoEntry {
  videoId: string;
  title: string;
  type: "college" | "nfl" | "combine" | "pro_day";
}

export function toKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function getHighlight(playerName: string): VideoEntry | null {
  const filePath = path.join(process.cwd(), "data", "highlights.json");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;
  const key = toKey(playerName);
  console.log("[db] looking up key:", key);
  const entry = raw[key];
  console.log("[db] raw entry:", entry);
  if (!entry || typeof entry !== "object" || !("videoId" in entry)) return null;
  const v = entry as VideoEntry;
  console.log("[db] v entry:", v);
  if (v.videoId === "YOUTUBE_ID_HERE") return null;
  console.log("[db] found:", v.videoId);
  return v;
}

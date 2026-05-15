// import type { SleeperPlayer } from "@/types/sleeper";

// let memCache: Record<string, SleeperPlayer> | null = null;
// const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
// let cacheTime = 0;

// export async function getPlayerDb(): Promise<Record<string, SleeperPlayer>> {
//   if (memCache && Date.now() - cacheTime < CACHE_TTL_MS) return memCache;

//   console.log("[cache] Fetching Sleeper player DB (~7MB)...");
//   const res = await fetch("https://api.sleeper.app/v1/players/nfl", {
//     cache: "no-store",
//   });
//   const data: Record<string, SleeperPlayer> = await res.json();

//   memCache = data;
//   cacheTime = Date.now();
//   return data;
// }

// export function clearPlayerDbCache() {
//   memCache = null;
//   cacheTime = 0;
// }

import fs from "fs";
import path from "path";
import type { SleeperPlayer } from "@/types/sleeper";

const CACHE_FILE = path.join(process.cwd(), ".cache", "players.json");
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

let memCache: Record<string, SleeperPlayer> | null = null;
let cacheTime = 0;

function readFileCache(): {
  data: Record<string, SleeperPlayer>;
  time: number;
} | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    return raw;
  } catch {
    return null;
  }
}

function writeFileCache(data: Record<string, SleeperPlayer>) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ data, time: Date.now() }));
  } catch (err) {
    console.warn("[cache] Could not write player cache file:", err);
  }
}

export async function getPlayerDb(): Promise<Record<string, SleeperPlayer>> {
  // 1. In-memory hit
  if (memCache && Date.now() - cacheTime < CACHE_TTL_MS) return memCache;

  // 2. File cache hit
  const fileCache = readFileCache();
  if (fileCache && Date.now() - fileCache.time < CACHE_TTL_MS) {
    memCache = fileCache.data;
    cacheTime = fileCache.time;
    console.log("[cache] Player DB loaded from file cache");
    return memCache;
  }

  // 3. Fetch from Sleeper
  console.log("[cache] Fetching Sleeper player DB (~7MB)...");
  const res = await fetch("https://api.sleeper.app/v1/players/nfl", {
    cache: "no-store",
  });
  const data: Record<string, SleeperPlayer> = await res.json();

  memCache = data;
  cacheTime = Date.now();
  writeFileCache(data);

  return data;
}

export function clearPlayerDbCache() {
  memCache = null;
  cacheTime = 0;
  try {
    if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE);
  } catch {}
}

#!/usr/bin/env npx tsx
// ─── CLI script to add a player highlight to the DB ──────────────────────────
//
// Usage:
//   npx tsx scripts/add-highlight.ts "Marvin Harrison Jr." dQw4w9WgXcQ college
//   npx tsx scripts/add-highlight.ts "Patrick Mahomes" abc123XYZ nfl
//
// The video ID is the part after ?v= in a YouTube URL.
// e.g. https://youtube.com/watch?v=dQw4w9WgXcQ  →  dQw4w9WgXcQ
//
// Type options: college | nfl | combine | pro_day

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data/highlights.json");

function toKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function run() {
  const [, , playerName, videoId, type = "college"] = process.argv;

  if (!playerName || !videoId) {
    console.error('Usage: npx tsx scripts/add-highlight.ts "Player Name" videoId [type]');
    console.error('Types: college | nfl | combine | pro_day');
    process.exit(1);
  }

  if (!["college", "nfl", "combine", "pro_day"].includes(type)) {
    console.error(`Invalid type "${type}". Use: college | nfl | combine | pro_day`);
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const key = toKey(playerName);

  if (db[key]) {
    console.log(`⚠️  Overwriting existing entry for "${playerName}" (key: ${key})`);
    console.log(`   Old: ${JSON.stringify(db[key])}`);
  }

  db[key] = {
    videoId,
    title: `${playerName} highlights`,
    type,
  };

  // Sort keys alphabetically (keeps the file readable; _comment stays first)
  const comment = db["_comment"];
  delete db["_comment"];
  const sorted = Object.fromEntries(Object.entries(db).sort(([a], [b]) => a.localeCompare(b)));
  const final = { _comment: comment, ...sorted };

  fs.writeFileSync(DB_PATH, JSON.stringify(final, null, 2) + "\n");
  console.log(`✅  Added: "${playerName}" → key "${key}", videoId "${videoId}", type "${type}"`);
  console.log(`   DB now has ${Object.keys(final).filter(k => !k.startsWith("_")).length} players.`);
  console.log(`   YouTube URL: https://youtube.com/watch?v=${videoId}`);
}

run();

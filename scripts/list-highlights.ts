#!/usr/bin/env npx tsx
// Lists all players in the highlights DB, optionally filtered by type.
// Usage:
//   npx tsx scripts/list-highlights.ts
//   npx tsx scripts/list-highlights.ts college
//   npx tsx scripts/list-highlights.ts nfl

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data/highlights.json");

function run() {
  const filterType = process.argv[2];
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

  const entries = Object.entries(db)
    .filter(([k]) => !k.startsWith("_"))
    .filter(([, v]: [string, any]) => !filterType || v.type === filterType)
    .sort(([a], [b]) => a.localeCompare(b));

  console.log(`\n🏈 Dynasty Draft — Highlight DB (${entries.length} players${filterType ? ` · ${filterType}` : ""})\n`);
  entries.forEach(([key, v]: [string, any]) => {
    console.log(`  ${key.padEnd(32)} ${v.videoId.padEnd(14)} [${v.type}]`);
  });
  console.log();
}

run();

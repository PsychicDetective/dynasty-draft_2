#!/usr/bin/env npx tsx
// Verifies all YouTube video IDs in the DB by checking they return 200.
// YouTube's oEmbed endpoint is free and requires no API key.
// Usage: npx tsx scripts/verify-highlights.ts
//
// Note: videos that are private/deleted return 404 from oEmbed.

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data/highlights.json");
const OEMBED = "https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=";
const DELAY_MS = 300; // be polite to YouTube

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function run() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const entries = Object.entries(db).filter(([k]) => !k.startsWith("_")) as [string, { videoId: string; title: string; type: string }][];

  console.log(`\nVerifying ${entries.length} YouTube video IDs...\n`);
  let ok = 0, broken: string[] = [];

  for (const [key, { videoId }] of entries) {
    try {
      const res = await fetch(`${OEMBED}${videoId}`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        process.stdout.write(`  ✅ ${key}\n`);
        ok++;
      } else {
        process.stdout.write(`  ❌ ${key} (${videoId}) — HTTP ${res.status}\n`);
        broken.push(key);
      }
    } catch {
      process.stdout.write(`  ⚠️  ${key} (${videoId}) — timeout/network error\n`);
      broken.push(key);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n✅ ${ok} valid   ❌ ${broken.length} broken`);
  if (broken.length) {
    console.log("\nBroken entries to fix:");
    broken.forEach(k => console.log(`  npx tsx scripts/add-highlight.ts "${k.replace(/_/g, " ")}" NEW_VIDEO_ID`));
  }
}

run();

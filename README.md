# 🏈 Dynasty Draft — Live Draft Experience

A cinematic, real-time dynasty fantasy football draft companion that syncs with your Sleeper league.

## Features

- **Live draft board** — real-time pick updates with smooth animations
- **On The Clock panel** — team name, owner, needs, countdown timer
- **Best Available sidebar** — tiered player rankings with ADP
- **Team Info sidebar** — roster, position needs, remaining picks
- **AI pick announcements** — TTS voice narration
- **Pick grading** — Grades every pick (A+ to F) with commentary
- **YouTube highlights** — auto-plays player highlight clips after each pick

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd dynasty-draft
npm install
```

### 2. Configure environment: IN PROGRESS

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SLEEPER_LEAGUE_ID=your_league_id
```

**Finding your Sleeper league ID:** Go to your league on sleeper.com — the ID is in the URL:  
`https://sleeper.com/leagues/123456789` → league ID is `123456789`

### 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` — it will redirect to `/draft/[your-league-id]`.

---

## YouTube Highlights

Highlight videos are served from a local JSON database at `data/highlights.json` — **no API key required**. YouTube video IDs are permanent and never expire.

The DB ships with ~60 players pre-seeded (2024 draft class + established dynasty stars).

### Managing the DB

```bash
# Add a player (video ID is the ?v= part of a YouTube URL)
npm run highlights:add "Marvin Harrison Jr." dQw4w9WgXcQ college

# List all players in the DB
npm run highlights:list

# Filter by type
npm run highlights:list nfl

# Verify all video IDs are still live (uses YouTube's free oEmbed endpoint)
npm run highlights:verify
```

Types: `college` | `nfl` | `combine` | `pro_day`

### Before your draft

Run `npm run highlights:verify` to check for any dead links, then add replacements with `npm run highlights:add`. Run `npm run highlights:list` to see who's missing from your specific league's likely draft pool.



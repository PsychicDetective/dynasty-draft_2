# 🏈 Dynasty Draft — Live Draft Experience

A cinematic, real-time dynasty fantasy football draft companion that syncs with your Sleeper league.

## Features

- **Live draft board** — real-time pick updates with smooth animations
- **On The Clock panel** — team name, owner, needs, countdown timer
- **Best Available sidebar** — tiered player rankings with ADP
- **Team Info sidebar** — roster, position needs, remaining picks
- **AI pick announcements** — ElevenLabs or OpenAI TTS voice narration
- **Pick grading** — Claude AI grades every pick (A+ to F) with commentary
- **YouTube highlights** — auto-plays player highlight clips after each pick
- **Traded pick tracking** — correctly maps traded draft picks to new owners
- **Mobile responsive** — works on phones and tablets

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd dynasty-draft
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SLEEPER_LEAGUE_ID=your_league_id
ELEVENLABS_API_KEY=...          # or use OPENAI_API_KEY + set TTS_PROVIDER=openai
ELEVENLABS_VOICE_ID=...         # default: Adam (deep announcer voice)
YOUTUBE_API_KEY=...
ANTHROPIC_API_KEY=...           # optional, for pick grading
TTS_PROVIDER=elevenlabs         # or "openai" or "browser"
```

**Finding your Sleeper league ID:** Go to your league on sleeper.com — the ID is in the URL:  
`https://sleeper.com/leagues/123456789` → league ID is `123456789`

### 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` — it will redirect to `/draft/[your-league-id]`.

---

## Architecture

```
app/
  draft/[leagueId]/page.tsx     ← draft room page
  api/
    sleeper/league/route.ts     ← fetches + maps all Sleeper data
    tts/route.ts                ← ElevenLabs / OpenAI TTS
    youtube/highlights/route.ts ← YouTube Data API search
    ai/grade/route.ts           ← Claude pick grading

components/draft/
  DraftRoom.tsx                 ← main layout shell
  TickerBar.tsx                 ← scrolling pick ticker
  OnTheClock.tsx                ← current team + countdown
  DraftBoard.tsx                ← full pick grid
  BestAvailable.tsx             ← available players panel
  TeamInfo.tsx                  ← team roster/needs panel
  PickAnnouncement.tsx          ← pick overlay + video

lib/
  sleeper/api.ts                ← raw Sleeper fetch wrappers
  sleeper/mappers.ts            ← raw → DraftState mapping
  sleeper/cache.ts              ← player DB caching (Vercel KV)
  audio/announcementQueue.ts    ← serial TTS queue
  youtube/search.ts             ← video search + cache
  store.ts                      ← Zustand global state

hooks/
  useLiveDraft.ts               ← SWR polling + new-pick detection
```

### Real-time strategy

Sleeper doesn't expose WebSockets to external apps. We use **smart polling**:

- `3 seconds` during active draft (`status === "drafting"`)
- `10 seconds` when paused or pre-draft

When `picks.length` increases, the new pick triggers:
1. Claude grading (async, non-blocking)
2. TTS audio generation (ElevenLabs or OpenAI)
3. YouTube highlight search
4. Announcement overlay display

---

## Deployment (Vercel)

```bash
vercel deploy
```

Add all env vars in the Vercel dashboard under **Settings → Environment Variables**.

For the player DB cache, add **Vercel KV** from the Vercel Storage tab and link to your project. The KV env vars are added automatically.

Without KV, the app falls back to in-memory caching — the 7MB player DB is re-fetched on cold starts.

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

---

## Voice Announcements

TTS announcements are not yet implemented — coming in a future update. The pick overlay shows the announcement script as text in the meantime.

---

## Future Features (pre-architected)

The codebase is structured to easily add:

- **AI scouting reports** — expand `/api/ai/grade` to return full analysis
- **Live commentary** — stream Claude commentary during picks
- **Trade analyzer** — `/api/ai/trade` endpoint with pick values
- **Commissioner controls** — pause/override via Sleeper commissioner API
- **KeepTradeCut / FantasyPros ADP** — swap `search_rank` in `mappers.ts`
- **Historical draft archive** — add PostgreSQL via Prisma for past draft storage

"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PosBadge } from "@/components/ui/PosBadge";
import { GradePill } from "@/components/ui/GradePill";

// ── Types (inline, no external import needed) ─────────────────────────────────

interface Pick {
  round: number; pickInRound: number; overallPick: number;
  status: "complete" | "current" | "upcoming";
  player: { fullName: string; position: string; college: string; nflTeam: string } | null;
  team: { teamName: string; ownerName: string; rosterId: number } | null;
  isTradedPick: boolean;
}
interface DraftState {
  leagueName: string; status: string;
  currentPickNumber: number; totalRounds: number; totalTeams: number;
  allPicks: Pick[];
  availablePlayers: { playerId: string; fullName: string; position: string; college: string; tier: number }[];
  teams: { rosterId: number; teamName: string; ownerName: string; remainingPickSlots: string[]; rosterPlayers: { fullName: string; position: string }[] }[];
}

const TOTAL_PICKS = 30; // 5 rounds × 6 teams

// ── Helpers ───────────────────────────────────────────────────────────────────

const posColor: Record<string, string> = {
  QB: "text-red-400", RB: "text-green-400", WR: "text-blue-400", TE: "text-amber-400",
};

async function apiFetch(method: string, body?: object): Promise<DraftState> {
  const res = await fetch("/api/sleeper/mock", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return res.json();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SimulatorPanel() {
  const [state, setState] = useState<DraftState | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastPick, setLastPick] = useState<Pick | null>(null);
  const [jumpVal, setJumpVal] = useState("");

  const load = useCallback(async (method: string, body?: object) => {
    setLoading(true);
    try {
      const prev = state;
      const next = await apiFetch(method, body);
      setState(next);
      // Detect new pick
      if (prev) {
        const prevDone = prev.allPicks.filter(p => p.status === "complete").length;
        const nextDone = next.allPicks.filter(p => p.status === "complete").length;
        if (nextDone > prevDone) {
          setLastPick(next.allPicks.filter(p => p.status === "complete").at(-1) ?? null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [state]);

  const reset   = () => { setLastPick(null); load("DELETE"); };
  const advance = () => load("POST");
  const jump    = () => { const n = parseInt(jumpVal, 10); if (!isNaN(n)) load("GET", undefined); else load("GET"); fetch(`/api/sleeper/mock?pick=${parseInt(jumpVal,10)||0}`).then(r=>r.json()).then(setState); };
  const jumpTo  = (n: number) => fetch(`/api/sleeper/mock?pick=${n}`).then(r=>r.json()).then(d => { setState(d); setLastPick(null); });

  const currentPick = state?.allPicks.find(p => p.status === "current");
  const done = state?.allPicks.filter(p => p.status === "complete") ?? [];
  const pct  = state ? Math.round((done.length / TOTAL_PICKS) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080d18] font-['Barlow_Condensed',sans-serif] text-white p-4">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase text-white">
              🏈 Draft Simulator
            </h1>
            <p className="text-xs text-gray-500 tracking-wider mt-0.5">
              Full draft control — no Sleeper account needed ·{" "}
              <a href="/draft/mock" className="text-[#C9A84C] hover:underline">Open draft room ↗</a>
            </p>
          </div>
          {state && (
            <div className="text-right">
              <div className="text-xs text-gray-500 tracking-wider">
                {state.leagueName}
              </div>
              <div className="font-mono text-sm text-[#C9A84C] mt-0.5">
                Pick {state.currentPickNumber} / {TOTAL_PICKS}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

        {/* ── Left column ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Control panel */}
          <div className="bg-[#0d1526] border border-[#1e2d45] rounded-xl p-4">
            <div className="text-[10px] font-black tracking-[.15em] text-gray-600 uppercase mb-3">
              Simulator Controls
            </div>

            {/* Progress bar */}
            {state && (
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                  <span>{done.length} picks complete</span>
                  <span>{TOTAL_PICKS - done.length} remaining</span>
                </div>
                <div className="h-1.5 bg-[#1e2d45] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A84C] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Main buttons */}
            <div className="flex gap-2 flex-wrap mb-3">
              {!state ? (
                <button
                  onClick={() => load("GET")}
                  className="bg-[#C9A84C] text-black font-black text-sm px-5 py-2 rounded-lg hover:bg-[#b8973e] transition-colors tracking-wider uppercase"
                >
                  Start Simulator
                </button>
              ) : (
                <>
                  <button
                    onClick={advance}
                    disabled={loading || done.length >= TOTAL_PICKS}
                    className="bg-[#C9A84C] text-black font-black text-sm px-5 py-2 rounded-lg hover:bg-[#b8973e] disabled:opacity-40 transition-colors tracking-wider uppercase"
                  >
                    {loading ? "…" : "Next Pick ▶"}
                  </button>
                  <button
                    onClick={() => { for(let i=0;i<5;i++) setTimeout(()=>load("POST"), i*120); }}
                    disabled={loading || done.length >= TOTAL_PICKS}
                    className="bg-[#131d2e] border border-[#263750] text-gray-300 font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#1a2540] disabled:opacity-40 transition-colors tracking-wider"
                  >
                    +5 Picks
                  </button>
                  <button
                    onClick={reset}
                    className="bg-[#131d2e] border border-[#263750] text-gray-400 font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#1a2540] transition-colors tracking-wider"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>

            {/* Jump to pick */}
            {state && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">
                  Jump to pick:
                </span>
                <input
                  type="number" min="0" max={TOTAL_PICKS} value={jumpVal}
                  onChange={e => setJumpVal(e.target.value)}
                  placeholder="0–30"
                  className="w-20 bg-[#080d18] border border-[#1e2d45] rounded px-2 py-1 text-sm font-mono text-white focus:border-[#C9A84C] focus:outline-none"
                />
                <button
                  onClick={jump}
                  className="text-xs font-bold text-[#C9A84C] hover:text-[#b8973e] tracking-wider uppercase"
                >
                  Go →
                </button>
                <span className="text-gray-700 text-xs ml-1">or</span>
                {/* Quick jump buttons */}
                {[1, 6, 12, 18, 24, 30].map(n => (
                  <button
                    key={n}
                    onClick={() => jumpTo(n)}
                    className="text-[10px] font-mono text-gray-600 hover:text-[#C9A84C] border border-[#1e2d45] rounded px-1.5 py-0.5 hover:border-[#C9A84C] transition-colors"
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* On the clock */}
          {state && currentPick && (
            <div className="bg-[#0d1526] border border-[#C9A84C]/30 rounded-xl p-4">
              <div className="text-[10px] font-black tracking-[.15em] text-[#C9A84C] uppercase mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse inline-block" />
                On The Clock
              </div>
              <div className="text-xl font-black text-white">{currentPick.team?.teamName}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                Pick {currentPick.round}.{String(currentPick.pickInRound).padStart(2,"0")} · #{currentPick.overallPick} overall · {currentPick.team?.ownerName}
              </div>
            </div>
          )}

          {/* Last pick announced */}
          <AnimatePresence mode="wait">
            {lastPick?.player && (
              <motion.div
                key={lastPick.overallPick}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="bg-[#0d1526] border border-[#1e2d45] rounded-xl overflow-hidden"
              >
                <div className="h-0.5 bg-[#C9A84C] w-full" />
                <div className="p-4">
                  <div className="text-[10px] font-black tracking-[.15em] text-[#C9A84C] uppercase mb-2">
                    Last Pick Announced
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-xl font-black text-white leading-tight">
                        {lastPick.player.fullName}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <PosBadge position={lastPick.player.position} size="sm" />
                        <span className="text-xs text-gray-500">{lastPick.player.college}</span>
                        <span className="text-xs text-gray-600">·</span>
                        <span className="text-xs text-gray-500">{lastPick.team?.teamName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-[#C9A84C]">
                        {lastPick.round}.{String(lastPick.pickInRound).padStart(2,"0")}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        #{lastPick.overallPick} overall
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-3 border-l-2 border-[#C9A84C]/30 pl-2.5 leading-relaxed">
                    "With the {lastPick.round}.{String(lastPick.pickInRound).padStart(2,"0")} pick, the {lastPick.team?.teamName} select {lastPick.player.fullName}, {lastPick.player.position.toLowerCase()}, from {lastPick.player.college}."
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draft board */}
          {state && (
            <div className="bg-[#0d1526] border border-[#1e2d45] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#1e2d45]">
                <span className="text-[10px] font-black tracking-[.15em] text-gray-600 uppercase">
                  Draft Board — {state.totalRounds} Rounds · {state.totalTeams} Teams
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2d45]">
                      <th className="text-left px-3 py-2 text-[9px] font-black tracking-widest text-gray-600 uppercase w-14">Pick</th>
                      <th className="text-left px-3 py-2 text-[9px] font-black tracking-widest text-gray-600 uppercase">Player</th>
                      <th className="text-left px-3 py-2 text-[9px] font-black tracking-widest text-gray-600 uppercase w-20">Pos</th>
                      <th className="text-left px-3 py-2 text-[9px] font-black tracking-widest text-gray-600 uppercase">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.allPicks.map(p => (
                      <tr
                        key={p.overallPick}
                        className={[
                          "border-b border-[#1e2d45]/50 transition-colors",
                          p.status === "current"   && "bg-[#C9A84C]/8 border-l-2 border-l-[#C9A84C]",
                          p.status === "complete"  && "opacity-55",
                          p.status === "upcoming"  && "opacity-30",
                        ].filter(Boolean).join(" ")}
                      >
                        <td className={`px-3 py-2 font-mono ${p.status==="current"?"text-[#C9A84C] font-bold":"text-gray-600"}`}>
                          {p.round}.{String(p.pickInRound).padStart(2,"0")}
                        </td>
                        <td className="px-3 py-2">
                          {p.player ? (
                            <span className="font-bold text-white">{p.player.fullName}</span>
                          ) : p.status === "current" ? (
                            <span className="text-[#C9A84C] font-bold animate-pulse">Selecting…</span>
                          ) : (
                            <span className="text-gray-700 italic">{p.team?.teamName}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {p.player && <PosBadge position={p.player.position} size="xs" />}
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-[10px] truncate max-w-[120px]">
                          {p.team?.teamName.split(" ").slice(-1)[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Available players */}
          {state && (
            <div className="bg-[#0d1526] border border-[#1e2d45] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#1e2d45]">
                <span className="text-[10px] font-black tracking-[.15em] text-gray-600 uppercase">
                  Best Available ({state.availablePlayers.length})
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {state.availablePlayers.slice(0,20).map((p,i) => (
                  <div key={p.playerId} className="flex items-center gap-2.5 px-3 py-2 border-b border-[#1e2d45]/40 hover:bg-[#131d2e] transition-colors">
                    <span className="font-mono text-[10px] text-gray-700 w-5">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px] text-white truncate">{p.fullName}</div>
                      <div className="text-[10px] text-gray-500">{p.college}</div>
                    </div>
                    <PosBadge position={p.position} size="xs" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team rosters */}
          {state && (
            <div className="bg-[#0d1526] border border-[#1e2d45] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#1e2d45]">
                <span className="text-[10px] font-black tracking-[.15em] text-gray-600 uppercase">
                  Team Rosters
                </span>
              </div>
              <div className="divide-y divide-[#1e2d45]">
                {state.teams.map(team => (
                  <div key={team.rosterId} className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-sm text-white">{team.teamName}</span>
                      <span className="text-[10px] text-gray-600 font-mono">
                        {team.rosterPlayers.length} players
                      </span>
                    </div>
                    {team.rosterPlayers.length === 0 ? (
                      <span className="text-[10px] text-gray-700 italic">No picks yet</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {team.rosterPlayers.map((p,i) => (
                          <span key={i} className="text-[10px] text-gray-400 bg-[#131d2e] border border-[#1e2d45] rounded px-1.5 py-0.5">
                            <span className={`font-bold mr-1 ${posColor[p.position]??""}`}>{p.position}</span>
                            {p.fullName.split(" ").slice(-1)[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API reference */}
          <div className="bg-[#0d1526] border border-[#1e2d45] rounded-xl p-4">
            <div className="text-[10px] font-black tracking-[.15em] text-gray-600 uppercase mb-3">
              Direct API Testing
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              {[
                ["GET",    "/api/sleeper/mock",          "Current state"],
                ["GET",    "/api/sleeper/mock?pick=15",  "Jump to pick 15"],
                ["POST",   "/api/sleeper/mock",          "Advance 1 pick"],
                ["POST",   "/api/sleeper/mock",          '{"pick":20} → jump'],
                ["DELETE", "/api/sleeper/mock",          "Reset to pick 0"],
                ["GET",    "/api/youtube/highlights?player=Marvin+Harrison+Jr.", "Highlight lookup"],
                ["POST",   "/api/ai/grade",              '{"pick":{…}} → grade'],
              ].map(([method, path, desc]) => (
                <div key={path+method} className="flex items-start gap-2">
                  <span className={`flex-shrink-0 text-[9px] font-black rounded px-1.5 py-0.5 ${
                    method==="GET"    ? "bg-blue-500/20 text-blue-400" :
                    method==="POST"   ? "bg-green-500/20 text-green-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>{method}</span>
                  <span className="text-gray-500 break-all leading-tight">{path}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

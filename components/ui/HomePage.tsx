"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type SleeperDraft = {
  draft_id: string;
  status: "pre_draft" | "drafting" | "complete" | "paused";
  season: string;
  type: string;
  settings: { rounds: number };
  start_time: number | null;
};

function Toast({
  message,
  type,
}: {
  message: string;
  type: "error" | "success";
}) {
  return (
    <div
      className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl
      font-display text-sm font-semibold tracking-wide animate-fade-up
      ${
        type === "error"
          ? "bg-red-500/20 border border-red-500/40 text-red-300"
          : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
      }
    `}
    >
      <span>{type === "error" ? "⚠️" : "✅"}</span>
      {message}
    </div>
  );
}

function FieldLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-white"
          style={{ left: `${(i + 1) * (100 / 13)}%` }}
        />
      ))}
      <div className="absolute left-0 right-0 top-1/2 border-t border-white" />
    </div>
  );
}

function statusLabel(status: SleeperDraft["status"]): {
  text: string;
  color: string;
  dot: string;
} {
  switch (status) {
    case "drafting":
      return {
        text: "LIVE",
        color: "text-red-400",
        dot: "bg-red-500 animate-pulse",
      };
    case "pre_draft":
      return { text: "UPCOMING", color: "text-gold", dot: "bg-gold" };
    case "complete":
      return { text: "COMPLETE", color: "text-gray-500", dot: "bg-gray-600" };
    case "paused":
      return { text: "PAUSED", color: "text-amber-400", dot: "bg-amber-400" };
    default:
      return { text: status, color: "text-gray-500", dot: "bg-gray-600" };
  }
}

export function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [leagueId, setLeagueId] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<SleeperDraft[] | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    const id = leagueId.trim();
    if (!id) return;

    setLoading(true);
    setToast(null);
    setDrafts(null);

    try {
      // Fetch league info + drafts in parallel
      const [leagueRes, draftsRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${id}`),
        fetch(`/api/sleeper/drafts?leagueId=${id}`),
      ]);

      if (!leagueRes.ok) {
        setToast({
          message: "League not found. Check your league ID and try again.",
          type: "error",
        });
        return;
      }

      const league = await leagueRes.json();
      const draftsData: SleeperDraft[] = await draftsRes.json();

      setLeagueName(league.name);

      if (!draftsData || draftsData.length === 0) {
        setToast({
          message: "No drafts found for this league yet.",
          type: "error",
        });
        return;
      }

      // If only one draft, go straight to it
      if (draftsData.length === 1) {
        navigateToDraft(draftsData[0]);
        return;
      }

      // Multiple drafts — show selection
      setDrafts(draftsData);
    } catch {
      setToast({
        message: "Something went wrong. Is your dev server running?",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function navigateToDraft(draft: SleeperDraft) {
    router.push(`/draft/${leagueId.trim()}?draftId=${draft.draft_id}`);
  }

  return (
    <div className="min-h-screen bg-[#080d18] font-display flex flex-col items-center justify-center relative overflow-hidden">
      <FieldLines />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl">🏈</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[.2em] text-red-400 uppercase">
              Live Draft Experience
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight text-center leading-none">
            Dynasty Draft
          </h1>
          <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
            Connect your Sleeper league and turn your draft into a cinematic
            broadcast experience.
          </p>
        </div>

        {/* Draft selection — shown after connecting if multiple drafts */}
        {drafts ? (
          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black tracking-[.15em] text-gray-500 uppercase">
                {leagueName}
              </span>
              <span className="text-sm text-gray-400">
                Select which draft to connect to:
              </span>
            </div>

            {drafts.map((draft) => {
              const { text, color, dot } = statusLabel(draft.status);
              return (
                <button
                  key={draft.draft_id}
                  onClick={() => navigateToDraft(draft)}
                  className="w-full bg-[#0d1526] border border-[#1e2d45] hover:border-[#C9A84C] rounded-xl px-4 py-3.5 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-display font-black text-sm group-hover:text-[#C9A84C] transition-colors">
                        {draft.season}{" "}
                        {draft.type === "dynasty" ? "Dynasty" : ""} Draft
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">
                        {draft.settings.rounds} rounds
                        {draft.start_time
                          ? ` · ${new Date(draft.start_time).toLocaleDateString()}`
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span
                        className={`text-[10px] font-black tracking-widest uppercase ${color}`}
                      >
                        {text}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => {
                setDrafts(null);
                setLeagueName("");
              }}
              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors tracking-wider text-center"
            >
              ← Change league ID
            </button>
          </div>
        ) : (
          /* League ID form */
          <form onSubmit={handleConnect} className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black tracking-[.15em] text-gray-500 uppercase">
                Sleeper League ID
              </label>
              <input
                ref={inputRef}
                type="text"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                placeholder="e.g. 123456789012345678"
                className="
                  w-full bg-[#0d1526] border border-[#1e2d45] rounded-xl
                  px-4 py-3.5 text-white font-mono text-sm
                  placeholder:text-gray-700
                  focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                  transition-colors
                "
              />
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Find your league ID in the Sleeper URL:{" "}
                <span className="text-gray-500 font-mono">
                  sleeper.com/leagues/
                </span>
                <span className="text-[#C9A84C] font-mono">YOUR_ID</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !leagueId.trim()}
              className="
                w-full bg-[#C9A84C] text-black font-black text-base
                px-6 py-3.5 rounded-xl tracking-widest uppercase
                hover:bg-[#b8973e] active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Connecting…
                </>
              ) : (
                <>Connect League →</>
              )}
            </button>
          </form>
        )}

        {/* How to find league ID — only show on initial form */}
        {!drafts && (
          <div className="w-full bg-[#0d1526] border border-[#1e2d45] rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-black tracking-[.15em] text-gray-600 uppercase">
              How to find your League ID
            </span>
            <ol className="text-xs text-gray-500 leading-relaxed list-none flex flex-col gap-1.5">
              <li className="flex gap-2">
                <span className="text-[#C9A84C] font-bold flex-shrink-0">
                  1.
                </span>
                Open Sleeper and go to your league
              </li>
              <li className="flex gap-2">
                <span className="text-[#C9A84C] font-bold flex-shrink-0">
                  2.
                </span>
                Look at the URL in your browser
              </li>
              <li className="flex gap-2">
                <span className="text-[#C9A84C] font-bold flex-shrink-0">
                  3.
                </span>
                Copy the long number after{" "}
                <span className="font-mono text-gray-400">/leagues/</span>
              </li>
            </ol>
          </div>
        )}

        {!drafts && (
          <button
            onClick={() => router.push("/simulator")}
            className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors tracking-wider"
          >
            Or try the simulator →
          </button>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-up { animation: fade-up 0.25s ease; }
      `}</style>
    </div>
  );
}

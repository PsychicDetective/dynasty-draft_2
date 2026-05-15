// Redirect /draft to require a leagueId
import { redirect } from "next/navigation";

export default function DraftPage() {
  const defaultId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (defaultId) redirect(`/draft/${defaultId}`);
  return (
    <main className="min-h-screen bg-pitch flex items-center justify-center font-display">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white mb-4 tracking-widest uppercase">
          Dynasty Draft
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Set <code className="text-gold">NEXT_PUBLIC_SLEEPER_LEAGUE_ID</code> in your .env.local
          <br />
          or visit <code className="text-gold">/draft/[your-league-id]</code> directly.
        </p>
      </div>
    </main>
  );
}

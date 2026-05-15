"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Resets the mock draft and redirects straight to the draft room.
// Visit /simulator to start fresh, or /simulator?pick=N to start mid-draft.

export default function SimulatorPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Resetting draft...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const startPick = params.get("pick") ?? "0";

    async function init() {
      try {
        // Reset to pick 0 (or jump to ?pick=N)
        await fetch(`/api/sleeper/mock?pick=${startPick}`);
        setStatus("Loading draft room...");
        router.replace("/draft/mock");
      } catch {
        setStatus("Failed to start simulator. Is the dev server running?");
      }
    }

    init();
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080d18",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Barlow Condensed', sans-serif",
      color: "#e8edf5",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32,
          border: "2px solid rgba(201,168,76,0.3)",
          borderTopColor: "#C9A84C",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ fontSize: 14, color: "#7a8fa8", letterSpacing: "0.1em" }}>
          {status}
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

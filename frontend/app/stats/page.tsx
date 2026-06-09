"use client";

import { useState } from "react";
import { fetchStats, ProfileStats } from "@/lib/api";
import StatsWidget from "@/components/StatsWidget";

type Phase = "form" | "loading" | "result" | "error";

export default function StatsPage() {
  const [handle, setHandle] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedHandle, setSubmittedHandle] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    const h = handle.trim();
    setSubmittedHandle(h.startsWith("@") ? h : `@${h}`);
    setPhase("loading");
    setErrorMsg("");
    try {
      const data = await fetchStats(h);
      setStats(data);
      setPhase("result");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Could not fetch profile.");
      setPhase("error");
    }
  }

  return (
    <main className="flex items-center justify-center px-4 py-12 min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-white mb-2">Quick Stats</h1>
          <p className="text-warm-white/40 text-sm">
            Live Instagram profile data. No audit, no wait.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center bg-dark-2 border border-white/10 rounded-lg overflow-hidden focus-within:border-teal transition-colors">
            <span className="px-4 text-warm-white/30 text-base select-none">@</span>
            <input
              type="text"
              value={handle.replace(/^@/, "")}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourhandle"
              required
              className="flex-1 bg-transparent text-warm-white placeholder-warm-white/20 py-3 pr-4 text-base outline-none"
            />
            <button
              type="submit"
              disabled={phase === "loading" || !handle.trim()}
              className="px-5 py-3 bg-teal text-dark font-bold text-sm hover:bg-teal/90 transition-colors disabled:opacity-40"
            >
              {phase === "loading" ? "…" : "Check"}
            </button>
          </div>
        </form>

        {phase === "loading" && (
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin" />
            <span className="text-warm-white/40 text-sm">Fetching live data…</span>
          </div>
        )}

        {phase === "error" && (
          <div className="px-4 py-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm mb-6">
            {errorMsg}
          </div>
        )}

        {phase === "result" && stats && (
          <StatsWidget handle={submittedHandle} stats={stats} />
        )}
      </div>
    </main>
  );
}

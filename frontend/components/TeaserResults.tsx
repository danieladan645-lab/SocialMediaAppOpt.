"use client";

import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import { TeaserData, AuditRequest } from "@/lib/api";
import { ARCHETYPES } from "@/lib/archetypes";
import TokenPackPicker from "@/components/TokenPackPicker";
import { useBalance } from "@/contexts/BalanceContext";

const RANK_THRESHOLDS: [number, number, string, string][] = [
  [90, 100, "Ragnarök", "#E8604C"],
  [75, 89,  "Dread",    "#F5A623"],
  [60, 74,  "Warbrand", "#3DBFBF"],
  [0,  59,  "Cub",      "rgba(255,255,255,0.4)"],
];

function getRank(scoreStr: string) {
  const match = scoreStr.match(/[\d.]+/);
  if (!match) return { name: "—", color: "rgba(255,255,255,0.4)" };
  let n = parseFloat(match[0]);
  if (n <= 10) n = n * 10;
  for (const [min, max, name, color] of RANK_THRESHOLDS) {
    if (n >= min && n <= max) return { name, color };
  }
  return { name: "Cub", color: "rgba(255,255,255,0.4)" };
}

const LOCKED_SECTIONS = [
  "Bio & CTA Analysis",
  "Visual Grid Breakdown",
  "Highlights Audit",
  "Content Strategy",
  "Audience Personas",
  "Recommendations",
  "Competitive Benchmark",
  "Score Breakdown",
];

interface Props {
  data: TeaserData;
  req: AuditRequest;
  onUnlock: () => void;
  onReset: () => void;
}

export default function TeaserResults({ data, req, onUnlock, onReset }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { balance } = useBalance();
  const rank = getRank(data.overall_score);
  const archetype = ARCHETYPES.find((a) => a.key === data.data_archetype);

  const isReady = isLoaded && isSignedIn && balance !== null && balance > 0;
  const noCredits = isLoaded && isSignedIn && balance === 0;

  void getToken;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 py-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-warm-white">{data.display_name}</h2>
          <p className="text-warm-white/40 text-sm mt-0.5">{req.handle} · Free Preview</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: rank.color }}>{data.overall_score}</p>
          <p className="text-sm mt-0.5" style={{ color: rank.color }}>{rank.name}</p>
        </div>
      </div>

      {/* Archetype */}
      {archetype && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold text-warm-white/30 uppercase tracking-widest mb-2">Archetype Identified</p>
          <p className="text-warm-white font-bold text-lg">{archetype.name}</p>
          <p className="text-warm-white/40 text-xs mt-1">{archetype.priority}</p>
          <p className="text-warm-white/60 text-sm mt-3">{data.archetype_gap_note}</p>
        </div>
      )}

      {/* Quick wins */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold text-warm-white/30 uppercase tracking-widest mb-4">Quick Wins</p>
        <ul className="space-y-3">
          {data.quick_wins.map((win, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-teal mt-0.5 shrink-0">✓</span>
              <span className="text-warm-white/80 text-sm">{win}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Locked sections */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 bg-white/5">
          <p className="text-xs font-semibold text-warm-white/30 uppercase tracking-widest">Full Audit — Locked</p>
        </div>
        <div className="divide-y divide-white/5">
          {LOCKED_SECTIONS.map((section) => (
            <div key={section} className="flex items-center justify-between px-5 py-3">
              <span className="text-warm-white/30 text-sm">{section}</span>
              <span className="text-warm-white/20 text-xs">🔒</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {noCredits ? (
        <div className="space-y-4">
          <p className="text-warm-white/50 text-sm text-center">You&apos;re out of audits. Get more to unlock the full report.</p>
          <TokenPackPicker />
        </div>
      ) : isReady ? (
        <button
          onClick={onUnlock}
          className="w-full py-4 bg-coral text-white font-bold text-base rounded-lg hover:bg-coral/90 transition-colors"
        >
          Unlock Full Audit →
        </button>
      ) : (
        <SignInButton mode="modal">
          <button className="w-full py-4 bg-coral text-white font-bold text-base rounded-lg hover:bg-coral/90 transition-colors">
            Sign In to Unlock Full Audit →
          </button>
        </SignInButton>
      )}

      <button
        onClick={onReset}
        className="w-full py-2 text-warm-white/30 text-sm hover:text-warm-white/60 transition-colors"
      >
        ← Audit a different handle
      </button>
    </div>
  );
}

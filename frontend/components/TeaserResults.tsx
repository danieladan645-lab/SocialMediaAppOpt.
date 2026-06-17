"use client";

import { useState } from "react";
import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import { TeaserData, AuditRequest } from "@/lib/api";
import { ARCHETYPES } from "@/lib/archetypes";
import TokenPackPicker from "@/components/TokenPackPicker";
import { useBalance } from "@/contexts/BalanceContext";

function getScoreColor(scoreStr: string): string {
  const match = scoreStr.match(/[\d.]+/);
  if (!match) return "text-warm-white/40";
  const n = parseFloat(match[0]);
  if (n >= 7) return "text-teal";
  if (n >= 5) return "text-gold";
  return "text-coral";
}

function parseNum(val: string): number | undefined {
  const n = parseInt(val.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? undefined : n;
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

interface ManualStats {
  manual_followers?: number;
  manual_following?: number;
  manual_posts?: number;
  manual_years?: number;
}

interface Props {
  data: TeaserData;
  req: AuditRequest;
  onUnlock: (extras: ManualStats) => void;
  onReset: () => void;
}

export default function TeaserResults({ data, req, onUnlock, onReset }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { balance } = useBalance();

  const [showStatInput, setShowStatInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [manualFollowers, setManualFollowers] = useState("");
  const [manualFollowing, setManualFollowing] = useState("");
  const [manualPosts, setManualPosts] = useState("");
  const [manualYears, setManualYears] = useState("");

  const archetype = ARCHETYPES.find((a) => a.key === data.data_archetype);

  const isReady = isLoaded && isSignedIn && balance !== null && balance > 0;
  const noCredits = isLoaded && isSignedIn && balance === 0;

  void getToken;

  function handleUnlock() {
    const extras: ManualStats = {};
    const f = parseNum(manualFollowers);
    const fo = parseNum(manualFollowing);
    const p = parseNum(manualPosts);
    const y = parseNum(manualYears);
    if (f !== undefined) extras.manual_followers = f;
    if (fo !== undefined) extras.manual_following = fo;
    if (p !== undefined) extras.manual_posts = p;
    if (y !== undefined) extras.manual_years = y;
    onUnlock(extras);
  }

  const statInputFields = [
    { label: "Followers", value: manualFollowers, set: setManualFollowers, placeholder: "e.g. 12500" },
    { label: "Following", value: manualFollowing, set: setManualFollowing, placeholder: "e.g. 800" },
    { label: "Posts", value: manualPosts, set: setManualPosts, placeholder: "e.g. 247" },
    { label: "Years Active", value: manualYears, set: setManualYears, placeholder: "e.g. 3" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 py-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-warm-white">{data.display_name}</h2>
          <p className="text-warm-white/40 text-sm mt-0.5">{req.handle} · Free Preview</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gold">{data.overall_score}</p>
        </div>
      </div>

      {/* Quick stats snapshot */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold text-warm-white/30 uppercase tracking-widest mb-4">Quick Stats</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xl font-bold text-teal">{data.estimated_followers || "—"}</p>
            <p className="text-xs text-warm-white/40 mt-1">Followers</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${data.bio_score ? getScoreColor(data.bio_score) : "text-warm-white/40"}`}>
              {data.bio_score || "—"}
            </p>
            <p className="text-xs text-warm-white/40 mt-1">Bio Score</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${data.content_score ? getScoreColor(data.content_score) : "text-warm-white/40"}`}>
              {data.content_score || "—"}
            </p>
            <p className="text-xs text-warm-white/40 mt-1">Content Score</p>
          </div>
        </div>
        <p className="text-xs text-warm-white/20 mt-3">* Follower count is an AI estimate based on public signals and may not be exact.</p>
        {data.biggest_gap && (
          <div className="p-3 rounded-lg bg-coral/10 border border-coral/20">
            <p className="text-xs font-semibold text-coral/70 uppercase tracking-widest mb-1">Biggest Gap Detected</p>
            <p className="text-sm text-warm-white/80">{data.biggest_gap}</p>
          </div>
        )}
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

      {/* Optional: refine stats before unlocking */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <button
          type="button"
          onClick={() => setShowStatInput(!showStatInput)}
          className="flex items-center gap-2 text-xs font-semibold text-warm-white/40 uppercase tracking-widest hover:text-warm-white/60 transition-colors w-full text-left"
        >
          <span className="text-warm-white/20">{showStatInput ? "▼" : "▶"}</span>
          Know Your Real Numbers?
          <span className="normal-case font-normal text-warm-white/20">(optional — improves full audit)</span>
        </button>
        {showStatInput && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {statInputFields.map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-xs text-warm-white/30 mb-1">{label}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-dark-2 border border-white/10 rounded-lg px-3 py-2 text-warm-white placeholder-warm-white/20 text-sm outline-none focus:border-teal transition-colors"
                />
              </div>
            ))}
            <p className="col-span-2 text-xs text-warm-white/25 mt-1">
              These override the AI estimates in the full audit report.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      {noCredits ? (
        <div className="space-y-4">
          <p className="text-warm-white/50 text-sm text-center">You&apos;re out of audits. Get more to unlock the full report.</p>
          <TokenPackPicker />
        </div>
      ) : isReady ? (
        showConfirm ? (
          <div className="rounded-xl border border-teal/30 bg-teal/5 p-5 space-y-4">
            <div>
              <p className="text-warm-white font-bold text-base">Confirm Audit</p>
              <p className="text-warm-white/50 text-sm mt-1">
                1 audit credit will be used — {(balance ?? 1) - 1} remaining after.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUnlock}
                className="flex-1 py-3 bg-coral text-white font-bold text-sm rounded-lg hover:bg-coral/90 transition-colors"
              >
                Confirm &amp; Run Audit →
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-3 text-warm-white/40 text-sm hover:text-warm-white/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-4 bg-coral text-white font-bold text-base rounded-lg hover:bg-coral/90 transition-colors"
          >
            Unlock Full Audit →
          </button>
        )
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

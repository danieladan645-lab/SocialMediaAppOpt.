"use client";

import { useState } from "react";
import { ARCHETYPES, ArchetypeKey } from "@/lib/archetypes";
import { AuditRequest } from "@/lib/api";

interface Props {
  onSubmit: (req: AuditRequest) => void;
  onCompare?: (req: { handle: string; competitor_handle: string; self_archetype: string }) => void;
  initialHandle?: string;
}

function parseNum(val: string): number | undefined {
  const n = parseInt(val.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? undefined : n;
}

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getFollowerRatio(user: number, comp: number) {
  if (comp === 0) return null;
  const ratio = user / comp;
  if (ratio >= 2) return {
    label: `${ratio.toFixed(1)}x ahead`,
    desc: `You have ${ratio.toFixed(1)}x more followers. You lead on reach — the audit reveals whether that reach is converting.`,
    color: "text-teal",
  };
  if (ratio >= 0.8) return {
    label: "Neck and neck",
    desc: "You're at reach parity. The full audit identifies the qualitative gaps that will break the tie in your favour.",
    color: "text-gold",
  };
  const behind = (1 / ratio).toFixed(1);
  return {
    label: `${behind}x behind`,
    desc: `Your competitor has ${behind}x more followers. The audit maps the fastest levers to close this gap.`,
    color: "text-coral",
  };
}

export default function AuditForm({ onSubmit, onCompare, initialHandle = "" }: Props) {
  const [handle, setHandle] = useState(initialHandle);
  const [competitorHandle, setCompetitorHandle] = useState("");
  const [archetype, setArchetype] = useState<ArchetypeKey | "">("");

  const [showStats, setShowStats] = useState(false);
  const [manualFollowers, setManualFollowers] = useState("");
  const [manualFollowing, setManualFollowing] = useState("");
  const [manualPosts, setManualPosts] = useState("");
  const [manualYears, setManualYears] = useState("");

  const [showCompStats, setShowCompStats] = useState(false);
  const [compFollowers, setCompFollowers] = useState("");

  const userF = parseNum(manualFollowers);
  const compF = parseNum(compFollowers);
  const ratio = userF && compF ? getFollowerRatio(userF, compF) : null;
  const hasCompetitor = competitorHandle.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim() || !archetype) return;
    const h = handle.startsWith("@") ? handle : `@${handle}`;
    const extras = {
      ...(parseNum(manualFollowers) !== undefined ? { manual_followers: parseNum(manualFollowers)! } : {}),
      ...(parseNum(manualFollowing) !== undefined ? { manual_following: parseNum(manualFollowing)! } : {}),
      ...(parseNum(manualPosts) !== undefined ? { manual_posts: parseNum(manualPosts)! } : {}),
      ...(parseNum(manualYears) !== undefined ? { manual_years: parseNum(manualYears)! } : {}),
    };
    if (hasCompetitor && onCompare) {
      const c = competitorHandle.startsWith("@") ? competitorHandle : `@${competitorHandle}`;
      onCompare({ handle: h, competitor_handle: c, self_archetype: archetype });
    } else {
      onSubmit({ handle: h, self_archetype: archetype, ...extras });
    }
  }

  const canSubmit = handle.trim().length > 0 && archetype !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Handle */}
      <div>
        <label className="block text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-2">
          Instagram Handle
        </label>
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
        </div>
      </div>

      {/* Your stats — before competitor */}
      <div>
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 text-xs font-semibold text-warm-white/40 uppercase tracking-widest hover:text-warm-white/60 transition-colors"
        >
          <span className="text-warm-white/20">{showStats ? "▼" : "▶"}</span>
          Your Stats
          <span className="normal-case font-normal text-warm-white/20">(optional — improves accuracy)</span>
        </button>
        {showStats && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Followers", value: manualFollowers, set: setManualFollowers, placeholder: "e.g. 12500" },
              { label: "Following", value: manualFollowing, set: setManualFollowing, placeholder: "e.g. 800" },
              { label: "Posts", value: manualPosts, set: setManualPosts, placeholder: "e.g. 247" },
              { label: "Years Active", value: manualYears, set: setManualYears, placeholder: "e.g. 3" },
            ].map(({ label, value, set, placeholder }) => (
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
              Leave blank to let the audit estimate them. Enter them to override with your real numbers.
            </p>
          </div>
        )}
      </div>

      {/* Competitor handle */}
      <div>
        <label className="block text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-2">
          Competitor Handle <span className="normal-case font-normal text-warm-white/20">(optional)</span>
        </label>
        <div className="flex items-center bg-dark-2 border border-white/10 rounded-lg overflow-hidden focus-within:border-coral transition-colors">
          <span className="px-4 text-warm-white/30 text-base select-none">@</span>
          <input
            type="text"
            value={competitorHandle.replace(/^@/, "")}
            onChange={(e) => setCompetitorHandle(e.target.value)}
            placeholder="competitorhandle"
            className="flex-1 bg-transparent text-warm-white placeholder-warm-white/20 py-3 pr-4 text-base outline-none"
          />
        </div>
        {hasCompetitor && (
          <p className="text-xs text-warm-white/30 mt-2">
            Compare mode — both profiles audited and scored side by side.
          </p>
        )}
      </div>

      {/* Competitor stats + follower ratio (only when competitor handle is filled) */}
      {hasCompetitor && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-warm-white/30 uppercase tracking-widest mb-2">Follower Ratio</p>
            <p className="text-xs text-warm-white/30 leading-relaxed">
              The follower ratio shows where you stand in raw reach vs your competitor. It&apos;s a starting signal — not a verdict. A 10x gap in followers doesn&apos;t mean you&apos;re losing. The full audit reveals conversion, trust, and content gaps that matter more than raw numbers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCompStats(!showCompStats)}
            className="text-xs text-teal/70 hover:text-teal transition-colors flex items-center gap-1"
          >
            <span>{showCompStats ? "▼" : "▶"}</span>
            {showCompStats ? "Hide competitor followers" : "Enter competitor followers to see ratio"}
          </button>

          {showCompStats && (
            <div>
              <label className="block text-xs text-warm-white/30 mb-1">Competitor Followers</label>
              <input
                type="text"
                inputMode="numeric"
                value={compFollowers}
                onChange={(e) => setCompFollowers(e.target.value)}
                placeholder="e.g. 45000"
                className="w-full bg-dark-2 border border-white/10 rounded-lg px-3 py-2 text-warm-white placeholder-warm-white/20 text-sm outline-none focus:border-coral transition-colors"
              />
            </div>
          )}

          {ratio && userF && compF && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-warm-white">{fmtFollowers(userF)}</p>
                  <p className="text-xs text-warm-white/40 mt-0.5">You</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${ratio.color}`}>{ratio.label}</p>
                  <p className="text-xs text-warm-white/30 mt-0.5">follower ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-warm-white">{fmtFollowers(compF)}</p>
                  <p className="text-xs text-warm-white/40 mt-0.5">Competitor</p>
                </div>
              </div>
              <p className="text-xs text-warm-white/40 text-center">{ratio.desc}</p>
            </div>
          )}
        </div>
      )}

      {/* Archetype */}
      <div>
        <label className="block text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-1">
          Your Brand Archetype
        </label>
        <p className="text-warm-white/30 text-xs mb-4">What kind of brand are you building?</p>
        <div className="grid grid-cols-1 gap-3">
          {ARCHETYPES.map((a) => {
            const selected = archetype === a.key;
            return (
              <button
                key={a.key}
                type="button"
                data-archetype={a.key}
                onClick={() => setArchetype(a.key)}
                className={[
                  "w-full text-left px-5 py-4 rounded-lg border transition-all",
                  selected
                    ? "border-teal bg-teal/10 text-warm-white"
                    : "border-white/10 bg-dark-2 text-warm-white/70 hover:border-white/25",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{a.name}</span>
                  {selected && <span className="text-teal text-xs font-semibold tracking-wide">SELECTED</span>}
                </div>
                <p className="mt-1 text-xs text-warm-white/40">{a.priority}</p>
                <p className="mt-1 text-xs text-warm-white/30 italic">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-4 bg-coral text-white font-bold text-base rounded-lg hover:bg-coral/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Run Audit →
      </button>
    </form>
  );
}

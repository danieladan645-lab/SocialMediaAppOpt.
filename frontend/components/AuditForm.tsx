"use client";

import { useState } from "react";
import { ARCHETYPES, ArchetypeKey } from "@/lib/archetypes";
import { AuditRequest } from "@/lib/api";

interface Props {
  onSubmit: (req: AuditRequest) => void;
  onCompare?: (req: { handle: string; competitor_handle: string; self_archetype: string }) => void;
  initialHandle?: string;
}

export default function AuditForm({ onSubmit, onCompare, initialHandle = "" }: Props) {
  const [handle, setHandle] = useState(initialHandle);
  const [competitorHandle, setCompetitorHandle] = useState("");
  const [archetype, setArchetype] = useState<ArchetypeKey | "">("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim() || !archetype) return;
    const h = handle.startsWith("@") ? handle : `@${handle}`;
    if (competitorHandle.trim() && onCompare) {
      const c = competitorHandle.startsWith("@") ? competitorHandle : `@${competitorHandle}`;
      onCompare({ handle: h, competitor_handle: c, self_archetype: archetype });
    } else {
      onSubmit({ handle: h, self_archetype: archetype });
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

      {/* Competitor handle (optional) */}
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
        {competitorHandle.trim() && (
          <p className="text-xs text-warm-white/30 mt-2">
            Compare mode — both profiles will be audited and scored side by side.
          </p>
        )}
      </div>

      {/* Archetype — placeholder layout, user designs these cards */}
      <div>
        <label className="block text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-1">
          Your Brand Archetype
        </label>
        <p className="text-warm-white/30 text-xs mb-4">
          What kind of brand are you building?
        </p>
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
                  <div>
                    <span className="font-bold text-sm">{a.name}</span>
                  </div>
                  {selected && (
                    <span className="text-teal text-xs font-semibold tracking-wide">SELECTED</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-warm-white/40">{a.priority}</p>
                <p className="mt-1 text-xs text-warm-white/30 italic">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
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

"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { AuditData } from "@/lib/api";
import AuditResults from "@/components/AuditResults";

interface AuditRecord {
  id: string;
  handle: string;
  tier: string;
  self_archetype: string;
  data_archetype: string;
  overall_score: string;
  audit_data: AuditData;
  created_at: string;
}

const RANK_THRESHOLDS: [number, number, string, string][] = [
  [90, 100, "Ragnarök", "text-coral"],
  [75, 89,  "Dread",    "text-gold"],
  [60, 74,  "Warbrand", "text-teal"],
  [0,  59,  "Cub",      "text-warm-white/40"],
];

function getRank(scoreStr: string) {
  const match = scoreStr?.match(/[\d.]+/);
  if (!match) return { name: "—", color: "text-warm-white/40" };
  let n = parseFloat(match[0]);
  if (n <= 10) n = n * 10;
  for (const [min, max, name, color] of RANK_THRESHOLDS) {
    if (n >= min && n <= max) return { name, color };
  }
  return { name: "Cub", color: "text-warm-white/40" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const { getClient } = useSupabase();
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<AuditData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = await getClient();
        const { data, error: err } = await supabase
          .from("audits")
          .select("*")
          .order("created_at", { ascending: false });
        if (err) throw err;
        setAudits(data ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (viewing) {
    return (
      <AuditResults
        data={viewing}
        onReset={() => setViewing(null)}
        backLabel="← Back to History"
      />
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-warm-white mb-1">Audit History</h1>
      <p className="text-warm-white/40 text-sm mb-8">All past audits, newest first.</p>

      {loading && (
        <div className="flex items-center gap-3 text-warm-white/40 text-sm">
          <div className="w-4 h-4 border border-teal border-t-transparent rounded-full animate-spin" />
          Loading…
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">
          {error}
        </div>
      )}

      {!loading && !error && audits.length === 0 && (
        <p className="text-warm-white/30 text-sm">
          No audits yet. Submit your first one from the home page.
        </p>
      )}

      <div className="space-y-3">
        {audits.map((record) => {
          const rank = getRank(record.overall_score);
          return (
            <div
              key={record.id}
              className="flex items-center justify-between px-5 py-4 bg-dark-2 border border-white/5 rounded-xl"
            >
              <div className="flex items-center gap-5">
                <div>
                  <div className="font-mono text-warm-white text-sm font-semibold">
                    {record.handle}
                  </div>
                  <div className="text-xs text-warm-white/30 mt-0.5">
                    {formatDate(record.created_at)} &middot; {record.tier}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gold">{record.overall_score}</div>
                  <div className={`text-xs font-semibold ${rank.color}`}>{rank.name}</div>
                </div>
              </div>
              <button
                onClick={() => setViewing(record.audit_data)}
                className="px-4 py-2 text-xs font-semibold text-teal border border-teal/30 rounded-lg hover:bg-teal/10 transition-colors"
              >
                View →
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}

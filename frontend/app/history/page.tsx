"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { AuditData } from "@/lib/api";
import AuditResults from "@/components/AuditResults";

interface AuditRecord {
  id: string;
  handle: string;
  tier: string;
  result: AuditData;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getScoreColor(scoreStr: string): string {
  const match = scoreStr?.match(/[\d.]+/);
  if (!match) return "text-warm-white/40";
  const n = parseFloat(match[0]);
  if (n >= 7) return "text-teal";
  if (n >= 5) return "text-gold";
  return "text-coral";
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
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
        <div className="text-center py-16">
          <p className="text-warm-white/30 text-sm mb-3">No audits yet.</p>
          <a href="/" className="text-teal text-sm hover:underline">Run your first audit →</a>
        </div>
      )}

      <div className="space-y-3">
        {audits.map((record) => {
          const score = record.result?.overall_score;
          return (
            <div
              key={record.id}
              className="flex items-center justify-between gap-4 px-4 sm:px-5 py-4 bg-dark-2 border border-white/5 rounded-xl"
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-warm-white text-sm font-semibold truncate">
                  {record.handle}
                </div>
                <div className="text-xs text-warm-white/30 mt-0.5">
                  {formatDate(record.created_at)} · {record.tier}
                </div>
              </div>
              {score && (
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</div>
                </div>
              )}
              <button
                onClick={() => setViewing(record.result)}
                className="shrink-0 px-4 py-2 text-xs font-semibold text-teal border border-teal/30 rounded-lg hover:bg-teal/10 transition-colors"
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

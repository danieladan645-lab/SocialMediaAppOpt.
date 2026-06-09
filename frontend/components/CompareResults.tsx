"use client";

import { CompareData, AuditData, ScoreRow } from "@/lib/api";

function parseScore(s: string): number {
  return parseFloat(s) || 0;
}

function ScoreTag({ score }: { score: string }) {
  const val = parseScore(score);
  const color = val >= 7 ? "text-teal" : val >= 5 ? "text-gold" : "text-coral";
  return <span className={`font-bold ${color}`}>{score}</span>;
}

interface Props {
  data: CompareData;
  onReset: () => void;
}

export default function CompareResults({ data, onReset }: Props) {
  const { user, competitor } = data;
  const userOverall = parseScore(user.overall_score);
  const compOverall = parseScore(competitor.overall_score);
  const userWinsOverall = userOverall > compOverall;

  const scoreRows = user.score_rows.map((row, i) => {
    const compRow: ScoreRow | undefined = competitor.score_rows[i];
    const uVal = parseScore(row.score_str);
    const cVal = parseScore(compRow?.score_str || "0");
    return {
      category: row.category,
      userScore: row.score_str,
      compScore: compRow?.score_str ?? "—",
      userWins: uVal > cVal,
      tied: uVal === cVal,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Nav */}
      <button
        onClick={onReset}
        className="text-warm-white/40 hover:text-warm-white text-sm transition-colors"
      >
        ← New Audit
      </button>

      {/* Header cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-2 border border-teal/30 rounded-xl p-6 text-center">
          <div className="text-xs text-warm-white/40 uppercase tracking-widest mb-2 font-semibold">You</div>
          <div className="font-mono text-warm-white text-lg mb-3">{user.handle}</div>
          <div className={`text-5xl font-bold ${userWinsOverall ? "text-teal" : "text-warm-white/60"}`}>
            {user.overall_score}
          </div>
          {userWinsOverall && (
            <div className="mt-2 text-xs text-teal font-semibold tracking-wide">WINNING</div>
          )}
        </div>
        <div className="bg-dark-2 border border-coral/30 rounded-xl p-6 text-center">
          <div className="text-xs text-warm-white/40 uppercase tracking-widest mb-2 font-semibold">Competitor</div>
          <div className="font-mono text-warm-white text-lg mb-3">{competitor.handle}</div>
          <div className={`text-5xl font-bold ${!userWinsOverall ? "text-coral" : "text-warm-white/60"}`}>
            {competitor.overall_score}
          </div>
          {!userWinsOverall && (
            <div className="mt-2 text-xs text-coral font-semibold tracking-wide">WINNING</div>
          )}
        </div>
      </div>

      {/* Stat cards side by side */}
      <div>
        <div className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-3">By The Numbers</div>
        <div className="grid grid-cols-2 gap-4">
          {/* User stats */}
          <div className="grid grid-cols-3 gap-2">
            {user.stat_cards.map((card) => (
              <div key={card.label} className="bg-dark-2 border border-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-teal">{card.value}</div>
                <div className="text-xs text-warm-white/40 mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>
          {/* Competitor stats */}
          <div className="grid grid-cols-3 gap-2">
            {competitor.stat_cards.map((card) => (
              <div key={card.label} className="bg-dark-2 border border-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-coral">{card.value}</div>
                <div className="text-xs text-warm-white/40 mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score comparison table */}
      <div>
        <div className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-3">Score Breakdown</div>
        <div className="bg-dark-2 border border-white/5 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 text-xs font-semibold text-warm-white/30 uppercase tracking-widest px-5 py-3 border-b border-white/5">
            <div>Category</div>
            <div className="text-center text-teal">You</div>
            <div className="text-center text-coral">Competitor</div>
            <div className="text-center">Result</div>
          </div>
          {scoreRows.map((row) => (
            <div
              key={row.category}
              className={`grid grid-cols-4 px-5 py-3 border-b border-white/5 last:border-0 ${
                row.category === "OVERALL" ? "bg-white/3 font-semibold" : ""
              }`}
            >
              <div className="text-sm text-warm-white/70">{row.category}</div>
              <div className="text-center text-sm"><ScoreTag score={row.userScore} /></div>
              <div className="text-center text-sm"><ScoreTag score={row.compScore} /></div>
              <div className="text-center text-sm">
                {row.tied ? (
                  <span className="text-warm-white/30">—</span>
                ) : row.userWins ? (
                  <span className="text-teal font-bold">▲ You</span>
                ) : (
                  <span className="text-coral font-bold">▼ Them</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your quick wins */}
      <div>
        <div className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-3">Your Quick Wins</div>
        <div className="space-y-2">
          {user.quick_wins.slice(0, 3).map((win, i) => (
            <div key={i} className="flex items-start gap-3 bg-dark-2 border border-white/5 rounded-xl px-5 py-3">
              <span className="text-teal font-bold text-sm mt-0.5">{i + 1}.</span>
              <p className="text-warm-white/70 text-sm leading-relaxed">{win}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Archetype gap summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-2 border border-white/5 rounded-xl p-5">
          <div className="text-xs text-warm-white/30 uppercase tracking-widest mb-2 font-semibold">Your Archetype Note</div>
          <p className="text-warm-white/60 text-sm leading-relaxed">{user.archetype_gap_note}</p>
        </div>
        <div className="bg-dark-2 border border-white/5 rounded-xl p-5">
          <div className="text-xs text-warm-white/30 uppercase tracking-widest mb-2 font-semibold">Their Archetype Note</div>
          <p className="text-warm-white/60 text-sm leading-relaxed">{competitor.archetype_gap_note}</p>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 border border-white/10 text-warm-white/50 font-semibold text-sm rounded-xl hover:border-white/20 hover:text-warm-white/70 transition-colors"
      >
        Run Another Audit
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { AuditData, downloadAuditDocx, downloadAuditPptx, suggestCompetitors } from "@/lib/api";
import { ARCHETYPES } from "@/lib/archetypes";

const COLOR_MAP: Record<string, string> = {
  coral: "#E8604C",
  teal:  "#3DBFBF",
  gold:  "#F5A623",
  gray:  "#888888",
};

function getArchetype(key: string) {
  return ARCHETYPES.find((a) => a.key === key);
}

interface Props {
  data: AuditData;
  onReset: () => void;
  backLabel?: string;
  onCompare?: (req: { handle: string; competitor_handle: string; self_archetype: string }) => void;
}

export default function AuditResults({ data, onReset, backLabel = "← New Audit", onCompare }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingPptx, setDownloadingPptx] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const selfA = getArchetype(data.self_archetype);
  const dataA = getArchetype(data.data_archetype);
  const hasGap = data.self_archetype !== data.data_archetype;

  async function handleDownload() {
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadAuditDocx(data);
    } catch {
      setDownloadError("Download failed. Make sure the backend is running.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadPptx() {
    setDownloadingPptx(true);
    setDownloadError("");
    try {
      await downloadAuditPptx(data);
    } catch {
      setDownloadError("Download failed. Make sure the backend is running.");
    } finally {
      setDownloadingPptx(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-dark/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="text-warm-white/30 hover:text-warm-white text-sm transition-colors"
          >
            {backLabel}
          </button>
          <span className="text-white/10">|</span>
          <span className="text-warm-white/50 text-sm font-mono">{data.handle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-warm-white/40 text-sm">{data.overall_score}</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* Hero: score + archetype gap */}
        <section>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-warm-white">{data.display_name}</h1>
              <p className="text-warm-white/30 text-sm mt-1">
                {data.date}
              </p>
            </div>
            <div className="text-right shrink-0 ml-6">
              <div className="text-4xl font-bold text-gold">{data.overall_score}</div>
            </div>
          </div>

          <div
            className={`p-5 rounded-xl border ${
              hasGap ? "border-coral/30 bg-coral/5" : "border-teal/30 bg-teal/5"
            }`}
          >
            <div className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-4">
              {hasGap ? "Archetype Gap Detected" : "Archetype Confirmed"}
            </div>
            <div className="flex items-start gap-8 mb-4">
              <div>
                <div className="text-xs text-warm-white/30 mb-1">You self-identify as</div>
                <div className="font-bold text-warm-white text-base">
                  {selfA?.name ?? data.self_archetype}
                </div>
                <div className="text-xs text-warm-white/40">{selfA?.priority}</div>
              </div>
              {hasGap && (
                <>
                  <div className="text-coral text-xl mt-4">→</div>
                  <div>
                    <div className="text-xs text-warm-white/30 mb-1">Your data says</div>
                    <div className="font-bold text-coral text-base">
                      {dataA?.name ?? data.data_archetype}
                    </div>
                    <div className="text-xs text-warm-white/40">{dataA?.priority}</div>
                  </div>
                </>
              )}
            </div>
            <p className="text-warm-white/70 text-sm leading-relaxed">{data.archetype_gap_note}</p>
          </div>
        </section>

        {/* Stat cards */}
        {data.stat_cards.length > 0 && (
          <section>
            <SectionLabel>By The Numbers</SectionLabel>
            <div className="grid grid-cols-3 gap-4">
              {data.stat_cards.map((card, i) => (
                <div
                  key={i}
                  className="bg-dark-2 border border-white/5 rounded-xl p-5 text-center"
                >
                  <div className="text-2xl font-bold text-teal">{card.value}</div>
                  <div className="text-xs text-warm-white/40 mt-1">{card.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick wins */}
        <section>
          <SectionLabel>Quick Wins</SectionLabel>
          <div className="space-y-2">
            {data.quick_wins.map((win, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 bg-dark-2 rounded-lg border border-white/5"
              >
                <span className="text-teal mt-0.5 shrink-0">✓</span>
                <span className="text-warm-white/80 text-sm">{win}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bio Analysis */}
        {data.bio_blocks.length > 0 && (
          <section>
            <SectionLabel>Bio Analysis</SectionLabel>
            <div className="space-y-3">
              {data.bio_blocks.map((block, i) => (
                <div key={i} className="bg-dark-2 border border-white/5 rounded-xl p-5 flex gap-4">
                  <div
                    className="w-1 rounded-full shrink-0"
                    style={{ backgroundColor: COLOR_MAP[block.color_key] ?? COLOR_MAP.teal }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-warm-white/60 uppercase tracking-wide">
                        {block.label}
                      </span>
                      <span className="text-xs text-warm-white/40">{block.score_str}</span>
                    </div>
                    <p className="text-warm-white/70 text-sm leading-relaxed">{block.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Visual Grid */}
        {data.grid_bullets.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest">Visual Grid & Aesthetic</h2>
              <span className="text-xs text-warm-white/40 font-mono">{data.grid_score}</span>
            </div>
            <div className="space-y-2">
              {data.grid_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 bg-dark-2 rounded-lg border border-white/5">
                  <span className="text-warm-white/20 shrink-0 mt-0.5">–</span>
                  <span className="text-warm-white/70 text-sm">{b}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Highlights Analysis */}
        {data.highlight_rows.length > 0 && (
          <section>
            <SectionLabel>Highlights Analysis</SectionLabel>
            <div className="bg-dark-2 border border-white/5 rounded-xl overflow-hidden mb-3">
              {data.highlight_rows.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-white/5 last:border-0">
                  <span className="text-warm-white/80 text-sm font-medium">{row.name}</span>
                  <span className="text-warm-white/50 text-sm">{row.cover_quality}</span>
                  <span className="text-teal text-sm">{row.recommendation}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-1">
              <p className="text-warm-white/50 text-xs">{data.highlight_action}</p>
              <span className="text-xs text-warm-white/40 font-mono shrink-0 ml-4">{data.highlight_score}</span>
            </div>
          </section>
        )}

        {/* Content Strategy */}
        {data.content_bars.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest">Content Strategy</h2>
              <span className="text-xs text-warm-white/40 font-mono">{data.content_score}</span>
            </div>
            <div className="space-y-3 mb-4">
              {data.content_bars.map((bar, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-warm-white/60">{bar.label}</span>
                    <span className="text-xs text-warm-white/40">{bar.pct}%</span>
                  </div>
                  <div className="h-2 bg-dark-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${bar.pct}%`,
                        backgroundColor: COLOR_MAP[bar.color_key] ?? COLOR_MAP.teal,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {data.content_bullets.length > 0 && (
              <div className="space-y-2">
                {data.content_bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-dark-2 rounded-lg border border-white/5">
                    <span className="text-warm-white/20 shrink-0 mt-0.5">–</span>
                    <span className="text-warm-white/70 text-sm">{b}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Customer Personas */}
        {data.personas.length > 0 && (
          <section>
            <SectionLabel>Customer Personas</SectionLabel>
            <div className="space-y-4">
              {data.personas.map((p, i) => (
                <div key={i} className="bg-dark-2 border border-white/5 rounded-xl overflow-hidden">
                  <div
                    className="px-5 py-3 text-sm font-bold"
                    style={{ color: COLOR_MAP[p.color_key] ?? COLOR_MAP.teal }}
                  >
                    {p.title}
                  </div>
                  <div className="px-5 pb-5 grid grid-cols-2 gap-x-8 gap-y-3">
                    {(([
                      ["Name", p.name],
                      ["Location", p.location],
                      ["Goals", p.goals],
                      ["Pain Points", p.pain_points],
                      ["Found Via", p.found_via],
                      ["First Impression", p.first_impression],
                      ["Needs", p.needs],
                      ["Conversion Path", p.conversion],
                    ]) as [string, string][]).map(([label, val]) => (
                      <div key={label}>
                        <div className="text-xs text-warm-white/30 mb-0.5">{label}</div>
                        <div className="text-sm text-warm-white/70">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 pb-4 border-t border-white/5 pt-3">
                    <p className="text-xs text-warm-white/50 italic">{p.implication}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Strengths */}
        {data.strengths.length > 0 && (
          <section>
            <SectionLabel>Strengths</SectionLabel>
            <div className="space-y-2">
              {data.strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 bg-dark-2 rounded-lg border border-white/5"
                >
                  <span className="text-teal shrink-0 mt-0.5">▲</span>
                  <div>
                    <span className="font-semibold text-warm-white text-sm">{s.title}</span>
                    <p className="text-warm-white/50 text-xs mt-0.5">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weaknesses & Opportunities */}
        {(data.weaknesses.length > 0 || data.opportunities.length > 0) && (
          <section>
            <SectionLabel>Weaknesses & Opportunities</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-coral/70 font-semibold uppercase tracking-wide mb-2">Weaknesses</div>
                {data.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-dark-2 rounded-lg border border-white/5">
                    <span className="text-coral/50 shrink-0 mt-0.5">▼</span>
                    <span className="text-warm-white/70 text-sm">{w}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-xs text-teal/70 font-semibold uppercase tracking-wide mb-2">Opportunities</div>
                {data.opportunities.map((o, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-dark-2 rounded-lg border border-white/5">
                    <span className="text-teal/50 shrink-0 mt-0.5">▲</span>
                    <span className="text-warm-white/70 text-sm">{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section>
          <SectionLabel>Recommendations</SectionLabel>
          <div className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-4 py-3 bg-dark-2 rounded-lg border border-white/5"
              >
                <span
                  className={`text-xs font-bold shrink-0 mt-0.5 w-10 ${
                    rec.priority === "HIGH"
                      ? "text-coral"
                      : rec.priority === "MED"
                      ? "text-gold"
                      : "text-warm-white/40"
                  }`}
                >
                  {rec.priority}
                </span>
                <div className="flex-1">
                  <p className="text-warm-white/80 text-sm">{rec.action}</p>
                  <p className="text-warm-white/30 text-xs mt-0.5">{rec.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Score summary */}
        <section>
          <SectionLabel>Score Summary</SectionLabel>
          <div className="bg-dark-2 rounded-xl border border-white/5 overflow-hidden">
            {data.score_rows.map((row, i) => {
              const isLast = i === data.score_rows.length - 1;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-3 ${
                    isLast
                      ? "border-t border-white/10"
                      : "border-b border-white/5"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isLast ? "font-bold text-warm-white" : "text-warm-white/60"
                    }`}
                  >
                    {row.category}
                  </span>
                  <span
                    className={`font-semibold text-sm ${
                      isLast ? "text-gold" : "text-warm-white/80"
                    }`}
                  >
                    {row.score_str}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Competitor comparison */}
        {onCompare && (
          <CompetitorPanel data={data} onCompare={onCompare} />
        )}

        {/* Download */}
        <section className="pb-12">
          {downloadError && (
            <p className="text-coral text-sm mb-3">{downloadError}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="py-4 bg-dark-2 border border-teal/30 text-teal font-bold text-sm rounded-xl hover:bg-teal/10 transition-all disabled:opacity-50"
            >
              {downloading ? "Generating…" : "↓ Word Doc"}
            </button>
            <button
              onClick={handleDownloadPptx}
              disabled={downloadingPptx}
              className="py-4 bg-dark-2 border border-teal/30 text-teal font-bold text-sm rounded-xl hover:bg-teal/10 transition-all disabled:opacity-50"
            >
              {downloadingPptx ? "Generating…" : "↓ PowerPoint"}
            </button>
          </div>
          <p className="text-center text-warm-white/20 text-xs mt-3">
            Full audit document. No extra Claude call.
          </p>
        </section>

      </div>
    </div>
  );
}

interface CompetitorPanelProps {
  data: AuditData;
  onCompare: (req: { handle: string; competitor_handle: string; self_archetype: string }) => void;
}

function CompetitorPanel({ data, onCompare }: CompetitorPanelProps) {
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [selected, setSelected] = useState("");
  const [manual, setManual] = useState("");

  useEffect(() => {
    suggestCompetitors(data).then(setSuggestions);
  }, [data]);

  const competitorHandle = selected || manual.trim();

  function handleRun() {
    if (!competitorHandle) return;
    const h = competitorHandle.startsWith("@") ? competitorHandle : `@${competitorHandle}`;
    onCompare({ handle: data.handle, competitor_handle: h, self_archetype: data.self_archetype });
  }

  return (
    <section className="border border-white/5 rounded-xl p-6 bg-dark-2">
      <div className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-1">
        Compare With a Competitor
      </div>
      <p className="text-warm-white/30 text-xs mb-5">
        See how you stack up side by side. We suggested some accounts below — click one or type your own.
      </p>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions === null ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-28 rounded-full bg-white/5 animate-pulse" />
            ))}
          </>
        ) : suggestions.length === 0 ? (
          <p className="text-warm-white/20 text-xs">No suggestions found — type a handle below.</p>
        ) : (
          suggestions.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => { setSelected(h); setManual(""); }}
              className={[
                "px-4 py-1.5 rounded-full border text-sm font-mono transition-all",
                selected === h
                  ? "border-teal bg-teal/10 text-teal"
                  : "border-white/10 text-warm-white/50 hover:border-white/25 hover:text-warm-white/70",
              ].join(" ")}
            >
              @{h}
            </button>
          ))
        )}
      </div>

      {/* Manual input */}
      <div className="flex items-center bg-dark border border-white/10 rounded-lg overflow-hidden focus-within:border-teal transition-colors mb-4">
        <span className="px-4 text-warm-white/30 text-sm select-none">@</span>
        <input
          type="text"
          value={manual}
          onChange={(e) => { setManual(e.target.value); setSelected(""); }}
          placeholder="or type a handle"
          className="flex-1 bg-transparent text-warm-white placeholder-warm-white/20 py-2.5 pr-4 text-sm outline-none"
        />
      </div>

      <button
        type="button"
        disabled={!competitorHandle}
        onClick={handleRun}
        className="w-full py-3 bg-coral text-white font-bold text-sm rounded-lg hover:bg-coral/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Run Comparison →
      </button>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-warm-white/40 uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

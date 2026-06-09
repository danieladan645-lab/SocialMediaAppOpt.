"use client";

import { useRouter } from "next/navigation";
import { ProfileStats } from "@/lib/api";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface Props {
  handle: string;
  stats: ProfileStats;
}

export default function StatsWidget({ handle, stats }: Props) {
  const router = useRouter();
  const ratio = stats.following > 0
    ? (stats.followers / stats.following).toFixed(2)
    : "—";

  const cards: { value: string; label: string; hint?: string }[] = [
    { value: fmt(stats.followers), label: "Followers" },
    { value: fmt(stats.following), label: "Following" },
    { value: fmt(stats.posts),     label: "Total Posts" },
    { value: ratio,                label: "Follower Ratio", hint: "Followers ÷ Following" },
  ];

  return (
    <div className="space-y-6">
      {/* Name + verified */}
      <div className="flex items-center gap-3">
        <div>
          <div className="text-warm-white font-bold text-lg">
            {stats.full_name || handle}
          </div>
          <div className="text-warm-white/40 text-sm font-mono">{handle.startsWith("@") ? handle : `@${handle}`}</div>
        </div>
        {stats.is_verified && (
          <span className="text-xs font-semibold text-teal bg-teal/10 border border-teal/20 px-2 py-0.5 rounded-full">
            ✓ Verified
          </span>
        )}
        {stats.is_private && (
          <span className="text-xs font-semibold text-warm-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            Private
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-dark-2 border border-white/5 rounded-xl p-5 text-center"
          >
            <div className="text-2xl font-bold text-teal">{card.value}</div>
            <div className="text-xs text-warm-white/40 mt-1">{card.label}</div>
            {card.hint && (
              <div className="text-xs text-warm-white/20 mt-0.5">{card.hint}</div>
            )}
          </div>
        ))}
      </div>

      {/* Bio */}
      {stats.bio && (
        <div className="bg-dark-2 border border-white/5 rounded-xl p-5">
          <div className="text-xs text-warm-white/30 uppercase tracking-widest mb-2 font-semibold">Bio</div>
          <p className="text-warm-white/70 text-sm leading-relaxed">{stats.bio}</p>
          {stats.external_url && (
            <a
              href={stats.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-teal bg-teal/10 border border-teal/20 px-3 py-1 rounded-full hover:bg-teal/20 transition-colors truncate max-w-full"
            >
              {stats.external_url}
            </a>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => {
          const h = handle.startsWith("@") ? handle.slice(1) : handle;
          router.push(`/?handle=${encodeURIComponent(h)}`);
        }}
        className="w-full py-4 bg-coral text-white font-bold text-base rounded-xl hover:bg-coral/90 transition-colors"
      >
        Get Full Audit →
      </button>
      <p className="text-center text-warm-white/20 text-xs -mt-3">
        Full brand diagnosis with actionable recommendations.
      </p>
    </div>
  );
}

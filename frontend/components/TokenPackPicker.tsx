"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createCheckout } from "@/lib/api";

const PACKS = [
  { id: "1",  audits: 1,  price: "$9",  label: "Starter" },
  { id: "5",  audits: 5,  price: "$35", label: "Best Value", highlight: true },
  { id: "10", audits: 10, price: "$60", label: "Power Pack" },
];

export default function TokenPackPicker() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(pack: string) {
    setLoading(pack);
    setError(null);
    try {
      const token = (await getToken()) ?? "";
      const { url } = await createCheckout(pack, token);
      window.location.href = url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-10 space-y-6">
      <div className="text-center">
        <p className="text-warm-white text-xl font-bold">You&apos;re out of audits.</p>
        <p className="text-warm-white/40 text-sm mt-1">Pick a pack to keep going.</p>
      </div>
      {error && (
        <p className="text-coral text-sm text-center">{error}</p>
      )}
      <div className="grid grid-cols-3 gap-4">
        {PACKS.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg border p-5 flex flex-col items-center gap-3 ${
              p.highlight
                ? "border-coral/50 bg-coral/5"
                : "border-white/10 bg-white/5"
            }`}
          >
            {p.highlight && (
              <span className="text-xs text-coral font-semibold uppercase tracking-wider">
                Best Value
              </span>
            )}
            <span className="text-3xl font-bold text-warm-white">{p.price}</span>
            <span className="text-warm-white/50 text-sm">
              {p.audits} audit{p.audits !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => handleBuy(p.id)}
              disabled={loading !== null}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                p.highlight
                  ? "bg-coral text-white hover:bg-coral/90"
                  : "bg-white/10 text-warm-white hover:bg-white/20"
              }`}
            >
              {loading === p.id ? "Redirecting…" : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

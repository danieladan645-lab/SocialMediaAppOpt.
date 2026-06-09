"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import AuditForm from "@/components/AuditForm";
import AuditResults from "@/components/AuditResults";
import CompareResults from "@/components/CompareResults";
import TokenPackPicker from "@/components/TokenPackPicker";
import { runAuditPreview, runCompareAudit, AuditData, CompareData, AuditRequest } from "@/lib/api";
import { useBalance } from "@/contexts/BalanceContext";

type Phase = "form" | "loading" | "results" | "compare";

const LOADING_MESSAGES = [
  "Scanning your brand presence…",
  "Counting what your competitors did better…",
  "Calculating the gap between potential and reality…",
  "Mapping your audience's unmet expectations…",
  "Assembling your audit…",
];

function HomeInner() {
  const searchParams = useSearchParams();
  const initialHandle = searchParams.get("handle") ?? "";
  const [phase, setPhase] = useState<Phase>("form");
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { balance, refresh: refreshBalance } = useBalance();

  function startLoading() {
    setError(null);
    setPhase("loading");
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 4000);
    return () => { clearInterval(interval); setLoadingMsg(LOADING_MESSAGES[0]); };
  }

  async function handleSubmit(req: AuditRequest) {
    const stop = startLoading();
    try {
      const token = (await getToken()) ?? undefined;
      const data = await runAuditPreview(req, token);
      setAuditData(data);
      setPhase("results");
      await refreshBalance();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Audit failed. Try again.";
      setError(msg);
      setPhase("form");
    } finally {
      stop();
    }
  }

  async function handleCompare(req: { handle: string; competitor_handle: string; self_archetype: string }) {
    const stop = startLoading();
    try {
      const token = (await getToken()) ?? undefined;
      const data = await runCompareAudit(req, token);
      setCompareData(data);
      setPhase("compare");
      await refreshBalance();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Compare failed. Try again.";
      setError(msg);
      setPhase("form");
    } finally {
      stop();
    }
  }

  if (phase === "loading") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-warm-white/50 text-sm tracking-wide">{loadingMsg}</p>
      </div>
    );
  }

  if (phase === "results" && auditData) {
    return (
      <AuditResults
        data={auditData}
        onCompare={handleCompare}
        onReset={() => {
          setPhase("form");
          setAuditData(null);
        }}
      />
    );
  }

  if (phase === "compare" && compareData) {
    return (
      <CompareResults
        data={compareData}
        onReset={() => {
          setPhase("form");
          setCompareData(null);
        }}
      />
    );
  }

  return (
    <main className="flex items-center justify-center px-4 py-12 min-h-[80vh]">
      <div className="w-full max-w-2xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-warm-white mb-3 leading-tight">
            Know exactly where<br />your brand stands.
          </h1>
          <p className="text-warm-white/40 text-base">
            Submit your handle. Get a full audit. No sugarcoating.
          </p>
        </div>
        {error && (
          <div className="mb-6 px-4 py-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">
            {error}
          </div>
        )}
        {isLoaded && !isSignedIn ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center space-y-4">
            <p className="text-warm-white/60 text-base">Sign in to run your first free audit.</p>
            <SignInButton mode="modal">
              <button className="px-6 py-2.5 rounded-lg bg-coral text-white font-semibold hover:bg-coral/90 transition-colors">
                Sign In — It&apos;s Free
              </button>
            </SignInButton>
          </div>
        ) : balance === 0 ? (
          <TokenPackPicker />
        ) : (
          <AuditForm onSubmit={handleSubmit} onCompare={handleCompare} initialHandle={initialHandle} />
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}

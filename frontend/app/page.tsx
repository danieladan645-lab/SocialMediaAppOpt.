"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import AuditForm from "@/components/AuditForm";
import AuditResults from "@/components/AuditResults";
import CompareResults from "@/components/CompareResults";
import TeaserResults from "@/components/TeaserResults";
import { runAuditPreview, runTeaserAudit, runCompareAudit, AuditData, CompareData, AuditRequest, TeaserData } from "@/lib/api";
import { useBalance } from "@/contexts/BalanceContext";

type Phase = "form" | "loading_teaser" | "teaser" | "loading_full" | "results" | "compare";

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
  const [teaserData, setTeaserData] = useState<TeaserData | null>(null);
  const [teaserReq, setTeaserReq] = useState<AuditRequest | null>(null);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { balance, refresh: refreshBalance } = useBalance();

  // After signing in while on the teaser screen, auto-run full audit if credits available
  useEffect(() => {
    if (isSignedIn && phase === "teaser" && teaserReq && balance !== null && balance > 0) {
      handleFullAudit(teaserReq);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, balance]);

  function startLoading(msg?: string) {
    setError(null);
    setLoadingMsg(msg || LOADING_MESSAGES[0]);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 4000);
    return () => { clearInterval(interval); setLoadingMsg(LOADING_MESSAGES[0]); };
  }

  async function handleTeaserSubmit(req: AuditRequest) {
    const stop = startLoading("Scanning profile…");
    setPhase("loading_teaser");
    try {
      const data = await runTeaserAudit(req);
      setTeaserData(data);
      setTeaserReq(req);
      setPhase("teaser");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Preview failed. Try again.";
      setError(msg);
      setPhase("form");
    } finally {
      stop();
    }
  }

  async function handleFullAudit(req: AuditRequest) {
    const stop = startLoading();
    setPhase("loading_full");
    try {
      const token = (await getToken()) ?? undefined;
      const data = await runAuditPreview(req, token);
      setAuditData(data);
      setPhase("results");
      await refreshBalance();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Audit failed. Try again.";
      setError(msg);
      setPhase("teaser");
    } finally {
      stop();
    }
  }

  async function handleCompare(req: { handle: string; competitor_handle: string; self_archetype: string }) {
    const stop = startLoading();
    setPhase("loading_full");
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

  // Loading screen (both teaser and full audit)
  if (phase === "loading_teaser" || phase === "loading_full") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-warm-white/50 text-sm tracking-wide">{loadingMsg}</p>
        {phase === "loading_teaser" && (
          <p className="text-warm-white/25 text-xs">Free preview — no sign-in required</p>
        )}
      </div>
    );
  }

  if (phase === "teaser" && teaserData && teaserReq) {
    return (
      <TeaserResults
        data={teaserData}
        req={teaserReq}
        onUnlock={(extras) => handleFullAudit({ ...teaserReq, ...extras })}
        onReset={() => {
          setPhase("form");
          setTeaserData(null);
          setTeaserReq(null);
          setError(null);
        }}
      />
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
            Submit your handle. Get a free preview instantly. No sign-in required.
          </p>
        </div>
        {error && (
          <div className="mb-6 px-4 py-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">
            {error}
          </div>
        )}
        <AuditForm onSubmit={handleTeaserSubmit} onCompare={handleCompare} initialHandle={initialHandle} />
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

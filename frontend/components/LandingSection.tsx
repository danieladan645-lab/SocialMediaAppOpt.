import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Submit your handle",
    body: "Enter your Instagram handle and select your brand type. Free preview starts instantly — no sign-in required.",
  },
  {
    num: "02",
    title: "See your gaps",
    body: "Get your overall score, biggest brand gap, archetype classification, and three quick wins. No payment needed.",
  },
  {
    num: "03",
    title: "Unlock the full report",
    body: "Bio analysis, content breakdown, audience personas, competitor benchmark, and 8 prioritised recommendations — plus DOCX and PPTX exports.",
  },
];

const PACKS = [
  { audits: 1,  price: "$9",  per: "$9 / audit",  label: "Single" },
  { audits: 5,  price: "$35", per: "$7 / audit",  label: "Best Value", highlight: true },
  { audits: 10, price: "$60", per: "$6 / audit",  label: "Power Pack" },
];

export default function LandingSection() {
  return (
    <div className="mt-16 space-y-14 pb-10">

      {/* How it works */}
      <section>
        <p className="text-xs font-semibold text-warm-white/30 uppercase tracking-widest mb-6">How it works</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div key={s.num} className="rounded-xl border border-white/8 bg-white/3 p-5">
              <p className="text-2xl font-bold text-white/10 mb-3">{s.num}</p>
              <p className="text-sm font-semibold text-warm-white mb-2">{s.title}</p>
              <p className="text-xs text-warm-white/40 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section>
        <p className="text-xs font-semibold text-warm-white/30 uppercase tracking-widest mb-2">Pricing</p>
        <p className="text-warm-white/40 text-sm mb-6">One-time credit packs. No subscription. Credits never expire.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKS.map((p) => (
            <div
              key={p.audits}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${
                p.highlight
                  ? "border-coral/40 bg-coral/5"
                  : "border-white/10 bg-white/3"
              }`}
            >
              {p.highlight && (
                <span className="text-xs text-coral font-semibold uppercase tracking-wider">Best Value</span>
              )}
              <div>
                <p className="text-2xl font-bold text-warm-white">{p.price}</p>
                <p className="text-sm text-warm-white/50 mt-0.5">
                  {p.audits} full audit{p.audits !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="text-xs text-warm-white/30">{p.per}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-warm-white/20 mt-4">
          Sign in after the free preview to purchase and unlock your full report.
        </p>
      </section>

      {/* Legal */}
      <p className="text-xs text-warm-white/15 text-center">
        By using Socialyze you agree to our{" "}
        <Link href="/terms" className="hover:text-warm-white/30 underline">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="hover:text-warm-white/30 underline">Privacy Policy</Link>.
      </p>

    </div>
  );
}

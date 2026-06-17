export const metadata = {
  title: "Privacy Policy — Socialyze",
};

export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-14 text-warm-white/70 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-warm-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-warm-white/30">Last updated: June 2025</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-white">What We Collect</h2>
        <p className="text-sm leading-relaxed">
          When you create an account, we collect your email address through Clerk (our authentication provider). When you run an audit, we store the Instagram handle you submit and the resulting audit report in our database. When you make a purchase, Stripe processes your payment — we never see or store your card details.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-white">How We Use It</h2>
        <p className="text-sm leading-relaxed">
          Your data is used solely to provide the Socialyze service: authenticating your account, running audits on your behalf, tracking your credit balance, and processing payments. We do not sell your data to third parties or use it for advertising.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-white">Third-Party Services</h2>
        <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
          <li><span className="text-warm-white/90">Clerk</span> — handles account creation and sign-in. Stores your email address.</li>
          <li><span className="text-warm-white/90">Stripe</span> — handles all payment processing. Subject to Stripe&apos;s own privacy policy.</li>
          <li><span className="text-warm-white/90">Anthropic (Claude)</span> — the AI model that generates your audit. Handle and public profile context are sent to Claude&apos;s API. No personally identifiable information beyond the Instagram handle is included.</li>
          <li><span className="text-warm-white/90">Supabase</span> — our database provider. Stores audit results and credit balances.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-white">Data Retention</h2>
        <p className="text-sm leading-relaxed">
          Audit results are stored indefinitely so you can access your history. You may request deletion of your data at any time by contacting us.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-white">Your Rights</h2>
        <p className="text-sm leading-relaxed">
          You can request access to, correction of, or deletion of your personal data by emailing us. We will respond within 30 days.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-white">Contact</h2>
        <p className="text-sm leading-relaxed">
          Questions about this policy? Email us at{" "}
          <a href="mailto:danieladan640@gmail.com" className="text-teal hover:underline">
            danieladan640@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}

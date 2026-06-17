import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-5xl font-bold text-warm-white/10">404</p>
      <div>
        <h1 className="text-xl font-bold text-warm-white mb-2">Page not found</h1>
        <p className="text-warm-white/40 text-sm">This page doesn&apos;t exist or was moved.</p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 bg-coral/10 border border-coral/30 text-coral text-sm rounded-lg hover:bg-coral/20 transition-colors"
      >
        Back to Socialyze →
      </Link>
    </main>
  );
}

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto px-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-warm-white/25">
      <span>© {new Date().getFullYear()} Socialyze. All rights reserved.</span>
      <div className="flex items-center gap-5">
        <Link href="/privacy" className="hover:text-warm-white/50 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-warm-white/50 transition-colors">Terms of Service</Link>
        <a href="mailto:danieladan640@gmail.com" className="hover:text-warm-white/50 transition-colors">Support</a>
      </div>
    </footer>
  );
}

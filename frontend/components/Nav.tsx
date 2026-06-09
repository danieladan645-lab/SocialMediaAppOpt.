"use client";

import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useBalance } from "@/contexts/BalanceContext";

export default function Nav() {
  const { isSignedIn, isLoaded } = useUser();
  const { balance } = useBalance();

  return (
    <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
      <Link href="/" className="text-coral font-bold tracking-tight text-lg">
        BRAND AUDIT
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/stats" className="text-warm-white/40 hover:text-warm-white text-sm transition-colors">
          Quick Stats
        </Link>
        <Link href="/" className="text-warm-white/40 hover:text-warm-white text-sm transition-colors">
          Full Audit
        </Link>
        {isLoaded && (
          isSignedIn ? (
            <div className="flex items-center gap-4">
              {balance !== null && (
                <span className="text-teal text-sm font-medium">
                  ● {balance} audit{balance !== 1 ? "s" : ""} remaining
                </span>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="text-sm px-4 py-1.5 rounded-lg bg-coral/10 border border-coral/30 text-coral hover:bg-coral/20 transition-colors">
                Sign In
              </button>
            </SignInButton>
          )
        )}
      </nav>
    </header>
  );
}

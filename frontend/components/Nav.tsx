"use client";

import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useBalance } from "@/contexts/BalanceContext";

export default function Nav() {
  const { isSignedIn, isLoaded } = useUser();
  const { balance } = useBalance();

  return (
    <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7 shrink-0">
          <rect width="512" height="512" rx="108" fill="#141418"/>
          <line x1="72" y1="176" x2="440" y2="176" stroke="#ffffff" strokeWidth="1" opacity="0.06"/>
          <line x1="72" y1="256" x2="440" y2="256" stroke="#ffffff" strokeWidth="1" opacity="0.06"/>
          <line x1="72" y1="336" x2="440" y2="336" stroke="#ffffff" strokeWidth="1" opacity="0.06"/>
          <line x1="72" y1="416" x2="440" y2="416" stroke="#ffffff" strokeWidth="1.5" opacity="0.12"/>
          <rect x="88"  y="256" width="60" height="160" rx="10" fill="#3DBFBF" opacity="0.35"/>
          <rect x="180" y="200" width="60" height="216" rx="10" fill="#3DBFBF" opacity="0.55"/>
          <rect x="272" y="144" width="60" height="272" rx="10" fill="#3DBFBF" opacity="0.75"/>
          <rect x="364" y="86"  width="60" height="330" rx="10" fill="#3DBFBF"/>
          <line x1="72" y1="296" x2="440" y2="296" stroke="#E8604C" strokeWidth="3" strokeLinecap="round" opacity="0.85"/>
          <circle cx="118" cy="296" r="8" fill="#E8604C"/>
          <circle cx="210" cy="296" r="8" fill="#E8604C"/>
          <circle cx="302" cy="296" r="8" fill="#E8604C"/>
          <circle cx="394" cy="296" r="8" fill="#E8604C"/>
        </svg>
        <span className="text-coral font-bold tracking-tight text-lg">BRAND AUDIT</span>
      </Link>
      <nav className="flex items-center gap-6">
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

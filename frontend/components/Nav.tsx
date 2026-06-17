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
          <defs>
            <clipPath id="nav-lens">
              <circle cx="205" cy="205" r="155"/>
            </clipPath>
          </defs>
          <g clipPath="url(#nav-lens)">
            <rect x="68"  y="270" width="50" height="100" rx="7" fill="#3DBFBF" opacity="0.35"/>
            <rect x="132" y="220" width="50" height="150" rx="7" fill="#3DBFBF" opacity="0.55"/>
            <rect x="196" y="165" width="50" height="205" rx="7" fill="#3DBFBF" opacity="0.75"/>
            <rect x="260" y="110" width="50" height="260" rx="7" fill="#3DBFBF"/>
            <polyline points="55,315 93,295 142,305 192,272 238,238 284,195 322,152 360,112" fill="none" stroke="#E8604C" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="93"  cy="295" r="8" fill="#E8604C"/>
            <circle cx="192" cy="272" r="8" fill="#E8604C"/>
            <circle cx="284" cy="195" r="8" fill="#E8604C"/>
          </g>
          <circle cx="205" cy="205" r="155" fill="none" stroke="#3DBFBF" strokeWidth="16"/>
          <line x1="326" y1="326" x2="448" y2="448" stroke="#E8604C" strokeWidth="26" strokeLinecap="round"/>
        </svg>
        <span className="text-coral font-bold tracking-tight text-lg">Socialyze</span>
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

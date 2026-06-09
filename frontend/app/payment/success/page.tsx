"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useBalance } from "@/contexts/BalanceContext";

export default function PaymentSuccess() {
  const { refresh } = useBalance();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="flex items-center justify-center px-4 py-12 min-h-[80vh]">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto">
          <span className="text-teal text-3xl font-bold">✓</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-warm-white">Payment successful.</h1>
          <p className="text-warm-white/40 mt-2 text-sm">
            Your credits have been added to your account.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-lg bg-coral text-white font-semibold hover:bg-coral/90 transition-colors"
        >
          Start Auditing →
        </Link>
      </div>
    </main>
  );
}

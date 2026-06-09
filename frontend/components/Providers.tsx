"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { BalanceProvider } from "@/contexts/BalanceContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <BalanceProvider>
        {children}
      </BalanceProvider>
    </ClerkProvider>
  );
}

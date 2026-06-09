"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface BalanceCtx {
  balance: number | null;
  setBalance: (n: number) => void;
  refresh: () => Promise<void>;
}

const BalanceContext = createContext<BalanceCtx>({
  balance: null,
  setBalance: () => {},
  refresh: async () => {},
});

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number | null>(null);
  const { getToken, isSignedIn } = useAuth();

  const refresh = useCallback(async () => {
    if (!isSignedIn) { setBalance(null); return; }
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch {}
  }, [getToken, isSignedIn]);

  useEffect(() => { refresh(); }, [isSignedIn, refresh]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, refresh }}>
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => useContext(BalanceContext);

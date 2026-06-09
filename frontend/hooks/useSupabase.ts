"use client";

import { useAuth } from "@clerk/nextjs";
import { createSupabaseClient } from "@/lib/supabase";

export function useSupabase() {
  const { getToken } = useAuth();

  async function getClient() {
    const token = await getToken({ template: "supabase" });
    if (!token) throw new Error("No Supabase token");
    return createSupabaseClient(token);
  }

  return { getClient };
}

"use client";

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function WakeUp() {
  useEffect(() => {
    fetch(`${API_BASE}/health`).catch(() => {});
  }, []);
  return null;
}

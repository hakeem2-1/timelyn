"use client";

import { useApp } from "@/context/AppProvider";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const { isHydrated } = useApp();

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
          <p className="text-sm text-zinc-500">Loading Timelyn...</p>
        </div>
      </div>
    );
  }

  return children;
}

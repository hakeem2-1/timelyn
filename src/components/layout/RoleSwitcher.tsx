"use client";

import { Shield, User } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const roles: { value: UserRole; label: string; icon: typeof Shield }[] = [
  { value: "admin", label: "Admin", icon: Shield },
  { value: "employee", label: "Employee", icon: User },
];

export function RoleSwitcher() {
  const { role, setRole } = useApp();

  return (
    <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
      {roles.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setRole(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            role === value
              ? "bg-violet-500/15 text-violet-300"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

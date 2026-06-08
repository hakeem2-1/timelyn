"use client";

import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppProvider";
import { Avatar } from "@/components/ui/Avatar";
import { RoleSwitcher } from "./RoleSwitcher";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { getEmployeeById, currentEmployeeId, role } = useApp();
  const currentUser = getEmployeeById(currentEmployeeId);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden text-sm text-zinc-500 sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <RoleSwitcher />
        <div className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 md:flex">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none lg:w-56"
          />
          <kbd className="hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 lg:inline">
            ⌘K
          </kbd>
        </div>
        <button className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500" />
        </button>
        <Link
          href={`/employees/${currentEmployeeId}`}
          className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-3 transition-colors hover:bg-zinc-800/50"
        >
          <Avatar initials={currentUser?.avatar ?? "SC"} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-200">
              {currentUser?.name ?? "Sarah Chen"}
            </p>
            <p className="text-xs text-zinc-500 capitalize">
              {role} · {currentUser?.role}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

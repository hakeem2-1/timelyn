"use client";


import { CheckSquare, ClipboardList, Clock, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useApp();

const navItems = isAdmin
  ? [
      { href: "/", label: "Team Overview", icon: Users },
      { href: "/employees", label: "Employees", icon: ClipboardList },
      { href: "/attendance", label: "Attendance", icon: Clock },
    ]
  : [
      { href: "/", label: "Today's Sheet", icon: CheckSquare },
      { href: "/tasks", label: "My Sheet", icon: ClipboardList },
      { href: "/attendance", label: "Attendance", icon: Clock },
    ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/80 bg-zinc-950 transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-100">
              Timelyn
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-violet-400" : "text-zinc-500"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800/80 p-4">
          <div className="rounded-lg bg-gradient-to-br from-violet-600/10 to-indigo-600/10 p-3 ring-1 ring-violet-500/20">
            <p className="text-xs font-medium text-violet-300">Daily Sheets</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {isAdmin ? "Assign & review team sheets" : "Update your daily sheet"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

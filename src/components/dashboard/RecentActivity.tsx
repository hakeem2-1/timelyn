"use client";

import {
  CheckSquare,
  Clock,
  MessageSquare,
  Sparkles,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { formatRelativeTime, getTodayISO } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { ActivityItem } from "@/types";

type ActivityFilter = "all" | ActivityItem["type"];

const typeConfig: Record<
  ActivityItem["type"],
  { icon: typeof CheckSquare; color: string; label: string }
> = {
  task: { icon: CheckSquare, color: "text-blue-400 bg-blue-500/10", label: "Tasks" },
  attendance: { icon: Clock, color: "text-emerald-400 bg-emerald-500/10", label: "Attendance" },
  employee: { icon: UserPlus, color: "text-violet-400 bg-violet-500/10", label: "Team" },
  milestone: { icon: Sparkles, color: "text-amber-400 bg-amber-500/10", label: "Milestones" },
  comment: { icon: MessageSquare, color: "text-indigo-400 bg-indigo-500/10", label: "Comments" },
};

function getActivityLink(item: ActivityItem): string | null {
  if (item.entityType === "task" && item.entityId) return `/tasks/${item.entityId}`;
  if (item.entityType === "employee" && item.entityId) return `/employees/${item.entityId}`;
  if (item.entityType === "attendance") return "/attendance";
  return null;
}

function groupLabel(timestamp: string): string {
  const today = getTodayISO();
  const date = timestamp.split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  return "Earlier";
}

export function RecentActivity() {
  const { activity } = useApp();
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const filtered = useMemo(() => {
    const items = filter === "all" ? activity : activity.filter((a) => a.type === filter);
    return items.slice(0, 12);
  }, [activity, filter]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: ActivityItem[] }[] = [];
    for (const item of filtered) {
      const label = groupLabel(item.timestamp);
      const existing = groups.find((g) => g.label === label);
      if (existing) existing.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [filtered]);

  const filterOptions: { key: ActivityFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "task", label: "Tasks" },
    { key: "attendance", label: "Attendance" },
    { key: "comment", label: "Comments" },
    { key: "milestone", label: "Milestones" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-zinc-100">Recent Activity</h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              {activity.length} events · live feed
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  filter === opt.key
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {grouped.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">
            No activity yet. Actions you take will appear here.
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              <p className="sticky top-0 bg-zinc-900/95 px-5 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 backdrop-blur-sm">
                {group.label}
              </p>
              {group.items.map((item, i) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                const href = getActivityLink(item);
                const content = (
                  <div
                    className={cn(
                      "flex items-start gap-3 px-5 py-3 transition-colors",
                      href && "hover:bg-zinc-800/30",
                      i < group.items.length - 1 && "border-b border-zinc-800/30"
                    )}
                  >
                    <div className={cn("rounded-lg p-2", config.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-300">{item.message}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {item.employeeName} · {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                    {href && (
                      <span className="text-xs text-violet-500/70">View →</span>
                    )}
                  </div>
                );

                return href ? (
                  <Link key={item.id} href={href}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>{content}</div>
                );
              })}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

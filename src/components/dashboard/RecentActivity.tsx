"use client";

import { CheckSquare, Clock, Sparkles, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { ActivityItem } from "@/types";

const typeConfig: Record<
  ActivityItem["type"],
  { icon: typeof CheckSquare; color: string }
> = {
  task: { icon: CheckSquare, color: "text-blue-400 bg-blue-500/10" },
  attendance: { icon: Clock, color: "text-emerald-400 bg-emerald-500/10" },
  employee: { icon: UserPlus, color: "text-violet-400 bg-violet-500/10" },
  milestone: { icon: Sparkles, color: "text-amber-400 bg-amber-500/10" },
};

export function RecentActivity() {
  const { activity } = useApp();

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-zinc-100">Recent Activity</h3>
        <p className="mt-0.5 text-sm text-zinc-500">Latest team updates</p>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {activity.slice(0, 8).map((item, i) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 px-5 py-3 ${
                i < activity.length - 1 ? "border-b border-zinc-800/40" : ""
              }`}
            >
              <div className={`rounded-lg p-2 ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-300">{item.message}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {item.employeeName} · {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

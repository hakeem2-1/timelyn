"use client";

import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  UserCheck,
} from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

function DashboardContent() {
  const { stats, visibleTasks, employees } = useApp();
  const inProgressTasks = visibleTasks.filter((t) => t.status === "in-progress").length;
  const topPerformers = [...employees]
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          trend={{ value: 12, label: "vs last month" }}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          subtitle={`${Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}% of team`}
          icon={UserCheck}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Tasks Completed Today"
          value={stats.tasksCompletedToday}
          icon={CheckCircle2}
          trend={{ value: 8, label: "vs yesterday" }}
          iconColor="text-violet-400"
        />
        <StatCard
          title="Hours Worked Today"
          value={`${stats.hoursWorkedToday}h`}
          icon={Clock}
          iconColor="text-indigo-400"
        />
        <StatCard
          title="Productivity Score"
          value={`${stats.productivityScore}%`}
          icon={TrendingUp}
          trend={{ value: 3.2, label: "this week" }}
          iconColor="text-amber-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-zinc-100">Quick Overview</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Today&apos;s snapshot</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tasks in progress</span>
                <span className="font-medium text-zinc-200">{inProgressTasks}</span>
              </div>
              <ProgressBar value={inProgressTasks} max={visibleTasks.length || 1} color="violet" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Team productivity</span>
                <span className="font-medium text-zinc-200">{stats.productivityScore}%</span>
              </div>
              <ProgressBar value={stats.productivityScore} color="emerald" />
            </div>
            <div className="border-t border-zinc-800/60 pt-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Top Performers
              </p>
              <div className="space-y-3">
                {topPerformers.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{emp.name}</span>
                    <span className="text-sm font-medium text-emerald-400">
                      {emp.performanceScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardPageInner() {
  const { getEmployeeById, currentEmployeeId, role } = useApp();
  const user = getEmployeeById(currentEmployeeId);
  return (
    <AppShell
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"} · ${role} view`}
    >
      <DashboardContent />
    </AppShell>
  );
}

export default function DashboardPage() {
  return <DashboardPageInner />;
}

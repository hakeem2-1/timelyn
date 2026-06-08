"use client";

import { useApp } from "@/context/AppProvider";
import { InsightCard } from "@/components/growth/InsightCard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";

function GrowthContent() {
  const { growthInsights, getEmployeeById } = useApp();

  const avgConsistency = Math.round(
    growthInsights.reduce((s, i) => s + i.consistencyScore, 0) / growthInsights.length
  );
  const avgAccuracy = Math.round(
    growthInsights.reduce((s, i) => s + i.deadlineAccuracy, 0) / growthInsights.length
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-semibold text-violet-400">{growthInsights.length}</p>
            <p className="mt-1 text-sm text-zinc-500">Employees with insights</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-semibold text-emerald-400">{avgConsistency}%</p>
            <p className="mt-1 text-sm text-zinc-500">Avg consistency score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-semibold text-indigo-400">{avgAccuracy}%</p>
            <p className="mt-1 text-sm text-zinc-500">Avg deadline accuracy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {growthInsights.map((insight) => {
          const employee = getEmployeeById(insight.employeeId);
          if (!employee) return null;
          return (
            <InsightCard
              key={insight.employeeId}
              employee={employee}
              insight={insight}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function GrowthPage() {
  return (
    <AppShell title="Growth Insights" subtitle="Personalized development recommendations">
      <GrowthContent />
    </AppShell>
  );
}

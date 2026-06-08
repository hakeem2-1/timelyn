import { AlertTriangle, CheckCircle2, Lightbulb, Target, TrendingUp } from "lucide-react";
import type { Employee, GrowthInsight } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface InsightCardProps {
  employee: Employee;
  insight: GrowthInsight;
}

export function InsightCard({ employee, insight }: InsightCardProps) {
  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar initials={employee.avatar} />
          <div>
            <h3 className="font-semibold text-zinc-100">{employee.name}</h3>
            <p className="text-sm text-zinc-500">
              {employee.role} · {employee.department}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Consistency
            </div>
            <ProgressBar value={insight.consistencyScore} color="emerald" showLabel />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Target className="h-3.5 w-3.5 text-violet-400" />
              Deadline Accuracy
            </div>
            <ProgressBar value={insight.deadlineAccuracy} color="violet" showLabel />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Strengths
          </div>
          <div className="flex flex-wrap gap-1.5">
            {insight.strengths.map((s) => (
              <span
                key={s}
                className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 ring-1 ring-emerald-500/20"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Areas to Improve
          </div>
          <div className="flex flex-wrap gap-1.5">
            {insight.weakAreas.map((w) => (
              <span
                key={w}
                className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 ring-1 ring-amber-500/20"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-zinc-800/60 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-violet-400">
            <Lightbulb className="h-3.5 w-3.5" />
            Suggested Improvements
          </div>
          <ul className="space-y-1.5">
            {insight.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

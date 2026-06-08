import { ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import type { Employee, SheetSummary } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const statusVariant = {
  active: "success",
  away: "warning",
  offline: "default",
  "on-leave": "info",
} as const;

interface EmployeeOverviewCardProps {
  employee: Employee;
  summary: SheetSummary;
}

export function EmployeeOverviewCard({ employee, summary }: EmployeeOverviewCardProps) {
  return (
    <Link href={`/employees/${employee.id}`}>
      <Card hover className="h-full">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar initials={employee.avatar} size="lg" />
              <div>
                <h3 className="font-semibold text-zinc-100">{employee.name}</h3>
                <p className="text-sm text-zinc-500">{employee.role}</p>
              </div>
            </div>
            <Badge variant={statusVariant[employee.status]}>{employee.status}</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Briefcase className="h-3.5 w-3.5" />
            {employee.department}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <div className="rounded-lg bg-zinc-800/50 px-2 py-2">
              <p className="text-lg font-semibold text-zinc-200">{summary.total}</p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-600">Assigned</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 px-2 py-2">
              <p className="text-lg font-semibold text-emerald-400">{summary.completed}</p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-600">Done</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 px-2 py-2">
              <p className="text-lg font-semibold text-blue-400">
                {summary.pending + summary.inProgress}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-600">Open</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 px-2 py-2">
              <p className="text-lg font-semibold text-amber-400">{summary.blocked}</p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-600">Blocked</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Today productivity</span>
              <span className="font-medium text-violet-400">{summary.productivity}%</span>
            </div>
            <ProgressBar value={summary.productivity} color="violet" />
          </div>

          <div className="flex items-center justify-end gap-1 border-t border-zinc-800/60 pt-3 text-xs text-zinc-500">
            View sheet <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

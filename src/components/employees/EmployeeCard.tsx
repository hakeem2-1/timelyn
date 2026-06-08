import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import type { Employee } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const statusVariant: Record<
  Employee["status"],
  "success" | "warning" | "default" | "info"
> = {
  active: "success",
  away: "warning",
  offline: "default",
  "on-leave": "info",
};

const statusLabel: Record<Employee["status"], string> = {
  active: "Active",
  away: "Away",
  offline: "Offline",
  "on-leave": "On Leave",
};

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Link href={`/employees/${employee.id}`}>
      <Card hover className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials={employee.avatar} size="lg" />
            <div>
              <h3 className="font-semibold text-zinc-100 group-hover:text-violet-300">{employee.name}</h3>
              <p className="text-sm text-zinc-500">{employee.role}</p>
            </div>
          </div>
          <Badge variant={statusVariant[employee.status]}>
            {statusLabel[employee.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {employee.department}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Performance</span>
            <span className="font-medium text-zinc-200">
              {employee.performanceScore}%
            </span>
          </div>
          <ProgressBar
            value={employee.performanceScore}
            color={
              employee.performanceScore >= 90
                ? "emerald"
                : employee.performanceScore >= 80
                  ? "violet"
                  : "amber"
            }
          />
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs text-zinc-500">
          <span className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            {employee.email}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

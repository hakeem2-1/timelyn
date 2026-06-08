"use client";

import { useApp } from "@/context/AppProvider";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const statusVariant: Record<
  "present" | "absent" | "partial" | "on-break",
  "success" | "danger" | "warning" | "info"
> = {
  present: "success",
  absent: "danger",
  partial: "warning",
  "on-break": "info",
};

export function AttendanceHistory() {
  const { attendance, getEmployeeById } = useApp();
  const sorted = [...attendance].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-zinc-100">Attendance History</h3>
        <p className="mt-0.5 text-sm text-zinc-500">Recent clock-in records</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 text-left text-xs text-zinc-500">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Clock In</th>
                <th className="px-5 py-3 font-medium">Clock Out</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((record) => {
                const employee = getEmployeeById(record.employeeId);
                return (
                  <tr
                    key={record.id}
                    className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-5 py-3 font-medium text-zinc-300">
                      {employee?.name ?? "Unknown"}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {record.clockIn ? formatTime(record.clockIn) : "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {record.clockOut ? formatTime(record.clockOut) : "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-300">
                      {record.totalHours > 0
                        ? `${record.totalHours}h`
                        : record.clockIn && !record.clockOut
                          ? "In progress"
                          : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[record.status]}>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

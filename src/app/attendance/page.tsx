"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useApp } from "@/context/AppProvider";

function formatTime(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(minutes = 0) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function AttendancePage() {
  const {
    employees,
    currentEmployeeId,
    isAdmin,
    today,
    attendance,
    getTodayAttendance,
    clockIn,
    startBreak,
    endBreak,
    clockOut,
  } = useApp();

  const visibleEmployees = isAdmin
    ? employees
    : employees.filter((employee) => employee.id === currentEmployeeId);

  return (
    <AppShell
      title="Attendance"
      subtitle="Track shift time, breaks, worked hours, and history"
    >
      <div className="grid gap-4">
        {visibleEmployees.map((employee) => {
          const record = getTodayAttendance(employee.id);
          const isWorking = Boolean(record?.clockIn && !record?.clockOut);
          const isOnBreak = record?.status === "on_break";

          return (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 text-lg font-semibold text-white">
                  <span>{employee.name}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-zinc-400">
                    {record?.status?.replace("_", " ") ?? "not started"}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 md:grid-cols-6">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">Date</p>
                    <p className="mt-1 font-medium text-white">{today}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-zinc-500">Shift</p>
                    <p className="mt-1 font-medium text-white">
                      {record?.shiftStart ?? "09:00"} - {record?.shiftEnd ?? "18:00"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-zinc-500">Clock In</p>
                    <p className="mt-1 font-medium text-white">
                      {formatTime(record?.clockIn)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-zinc-500">Clock Out</p>
                    <p className="mt-1 font-medium text-white">
                      {formatTime(record?.clockOut)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-zinc-500">Break</p>
                    <p className="mt-1 font-medium text-white">
                      {formatMinutes(record?.breakMinutes)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-zinc-500">Worked</p>
                    <p className="mt-1 font-medium text-white">
                      {formatMinutes(record?.workedMinutes)}
                    </p>
                  </div>
                </div>

                {!isAdmin && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={Boolean(record?.clockIn)}
                      onClick={() => clockIn(employee.id)}
                      className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Clock In
                    </button>

                    <button
                      type="button"
                      disabled={!isWorking || isOnBreak}
                      onClick={() => startBreak(employee.id)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Start Break
                    </button>

                    <button
                      type="button"
                      disabled={!isWorking || !isOnBreak}
                      onClick={() => endBreak(employee.id)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      End Break
                    </button>

                    <button
                      type="button"
                      disabled={!isWorking || isOnBreak}
                      onClick={() => clockOut(employee.id)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Clock Out
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isAdmin && (
        <Card className="mt-6">
          <CardHeader>
            <div className="text-lg font-semibold text-white">Attendance History</div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">Employee</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Clock In</th>
                    <th className="px-3 py-2">Clock Out</th>
                    <th className="px-3 py-2">Break</th>
                    <th className="px-3 py-2">Worked</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {attendance.map((record) => {
                    const employee = employees.find(
                      (item) => item.id === record.employeeId,
                    );

                    return (
                      <tr key={record.id}>
                        <td className="px-3 py-3 text-white">
                          {employee?.name ?? "Unknown"}
                        </td>
                        <td className="px-3 py-3 text-zinc-400">{record.date}</td>
                        <td className="px-3 py-3 text-zinc-400">
                          {formatTime(record.clockIn)}
                        </td>
                        <td className="px-3 py-3 text-zinc-400">
                          {formatTime(record.clockOut)}
                        </td>
                        <td className="px-3 py-3 text-zinc-400">
                          {formatMinutes(record.breakMinutes)}
                        </td>
                        <td className="px-3 py-3 text-zinc-400">
                          {formatMinutes(record.workedMinutes)}
                        </td>
                        <td className="px-3 py-3 capitalize text-zinc-400">
                          {record.status.replace("_", " ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
"use client";

import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { AppShell } from "@/components/layout/AppShell";
import { DailySheetView } from "@/components/sheet/DailySheetView";
import { SheetSummaryCards } from "@/components/sheet/SheetSummaryCards";
import { TodEodPanel } from "@/components/sheet/TodEodPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    getEmployeeById,
    getSheetHistory,
    getSheetSummary,
    today,
    isAdmin,
    currentEmployeeId,
  } = useApp();

  const employee = getEmployeeById(id);
  const history = getSheetHistory(id);
  const dates = history.length > 0 ? history : [today];
  const [selectedDate, setSelectedDate] = useState(today);

  if (!employee) {
    return (
      <AppShell title="Not Found" subtitle="">
        <p className="text-center text-zinc-500 py-12">Employee not found.</p>
        <Link href="/" className="text-sm text-violet-400 hover:underline">
          ← Back
        </Link>
      </AppShell>
    );
  }

  const summary = getSheetSummary(id, selectedDate);
  const sheetMode = isAdmin
    ? "admin"
    : id === currentEmployeeId
      ? "employee"
      : "readonly";

  return (
    <AppShell title={employee.name} subtitle={`${employee.role} · ${employee.department}`}>
      <div className="space-y-6">
        <Link
          href={isAdmin ? "/" : "/tasks"}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-center gap-3">
          <Avatar initials={employee.avatar} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{employee.name}</h2>
            <Badge variant="default">{employee.department}</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <CardContent className="space-y-2 pt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Sheet History
              </p>
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    selectedDate === date
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-zinc-400 hover:bg-zinc-800/50"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatDate(date)}</span>
                  {date === today && (
                    <span className="ml-auto text-[10px] text-violet-400">Today</span>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-3">
            <SheetSummaryCards summary={summary} />
            <DailySheetView employeeId={id} date={selectedDate} mode={sheetMode} />
            <TodEodPanel
              employeeId={id}
              date={selectedDate}
              readOnly={sheetMode === "readonly"}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

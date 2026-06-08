"use client";

import { useApp } from "@/context/AppProvider";
import { DailySheetView } from "@/components/sheet/DailySheetView";
import { SheetSummaryCards } from "@/components/sheet/SheetSummaryCards";
import { TodEodPanel } from "@/components/sheet/TodEodPanel";

interface EmployeeTodaySheetProps {
  employeeId: string;
}

export function EmployeeTodaySheet({ employeeId }: EmployeeTodaySheetProps) {
  const { today, getSheetSummary } = useApp();
  const summary = getSheetSummary(employeeId, today);

  return (
    <div className="space-y-6">
      <SheetSummaryCards summary={summary} />
      <DailySheetView employeeId={employeeId} date={today} mode="employee" />
      <TodEodPanel employeeId={employeeId} date={today} />
    </div>
  );
}

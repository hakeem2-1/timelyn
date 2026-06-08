"use client";

import { useApp } from "@/context/AppProvider";
import { EmployeeOverviewCard } from "@/components/sheet/EmployeeOverviewCard";

export function AdminHome() {
  const { employees, today, getSheetSummary } = useApp();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {employees.map((employee) => (
        <EmployeeOverviewCard
          key={employee.id}
          employee={employee}
          summary={getSheetSummary(employee.id, today)}
        />
      ))}
    </div>
  );
}

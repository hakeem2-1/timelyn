"use client";

import { useApp } from "@/context/AppProvider";
import { AdminHome } from "@/components/home/AdminHome";
import { EmployeeTodaySheet } from "@/components/home/EmployeeTodaySheet";
import { AppShell } from "@/components/layout/AppShell";

export default function HomePage() {
  const { isAdmin, getEmployeeById, currentEmployeeId } = useApp();
  const user = getEmployeeById(currentEmployeeId);

  if (isAdmin) {
    return (
      <AppShell title="Team Overview" subtitle="Today's employee sheets">
        <AdminHome />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Today's Sheet"
      subtitle={`${user?.name ?? "Employee"} · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}
    >
      <EmployeeTodaySheet employeeId={currentEmployeeId} />
    </AppShell>
  );
}

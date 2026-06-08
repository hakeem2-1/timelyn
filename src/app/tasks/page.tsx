"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/context/AppProvider";
import { EmployeeTodaySheet } from "@/components/home/EmployeeTodaySheet";
import { AppShell } from "@/components/layout/AppShell";

export default function TasksPage() {
  const { isAdmin, currentEmployeeId, getEmployeeById } = useApp();
  const router = useRouter();
  const user = getEmployeeById(currentEmployeeId);

  useEffect(() => {
    if (isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, router]);

  return (
    <AppShell
      title="Today's Sheet"
      subtitle={`${user?.name ?? "Employee"} · Daily task sheet`}
    >
      <EmployeeTodaySheet employeeId={currentEmployeeId} />
    </AppShell>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/context/AppProvider";
import { AdminHome } from "@/components/home/AdminHome";
import { EmployeeTodaySheet } from "@/components/home/EmployeeTodaySheet";
import { AppShell } from "@/components/layout/AppShell";

export default function EmployeesPage() {
  const { isAdmin, currentEmployeeId, getEmployeeById } = useApp();
  const router = useRouter();
  const user = getEmployeeById(currentEmployeeId);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/tasks");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return (
      <AppShell title="Today's Sheet" subtitle={user?.name}>
        <EmployeeTodaySheet employeeId={currentEmployeeId} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Team" subtitle="Employee daily sheets — today">
      <AdminHome />
    </AppShell>
  );
}

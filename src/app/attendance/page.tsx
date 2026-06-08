"use client";

import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { ClockPanel } from "@/components/attendance/ClockPanel";
import { AppShell } from "@/components/layout/AppShell";

export default function AttendancePage() {
  return (
    <AppShell title="Attendance" subtitle="Track work hours and breaks">
      <div className="space-y-6">
        <ClockPanel />
        <AttendanceHistory />
      </div>
    </AppShell>
  );
}

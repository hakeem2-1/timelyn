"use client";

import {
  AttendanceMetric,
  HoursChart,
  ProductivityChart,
  TaskTrendChart,
  TeamPerformance,
} from "@/components/analytics/Charts";
import { AppShell } from "@/components/layout/AppShell";

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics" subtitle="Team performance metrics and trends">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ProductivityChart />
          <HoursChart />
        </div>
        <TaskTrendChart />
        <div className="grid gap-6 lg:grid-cols-3">
          <AttendanceMetric />
          <div className="lg:col-span-2">
            <TeamPerformance />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

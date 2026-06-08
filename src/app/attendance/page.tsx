"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";

export default function AttendancePage() {
  return (
    <AppShell title="Attendance" subtitle="Coming in a future release">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-zinc-500">
            Attendance tracking is being integrated with daily sheets in a future update.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics" subtitle="Sheet productivity insights">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-zinc-500">
            Analytics will aggregate daily sheet completion rates across the team.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";

export default function GrowthPage() {
  return (
    <AppShell title="Growth Insights" subtitle="Employee development">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-zinc-500">
            Growth insights will be derived from daily sheet patterns and completion quality.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

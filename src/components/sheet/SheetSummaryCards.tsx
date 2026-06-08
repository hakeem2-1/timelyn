import { Calendar, CheckCircle2, Circle, Clock, Loader2, OctagonAlert } from "lucide-react";
import type { SheetSummary } from "@/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

interface SheetSummaryCardsProps {
  summary: SheetSummary;
}

export function SheetSummaryCards({ summary }: SheetSummaryCardsProps) {
  const cards = [
    {
      label: "Date",
      value: formatDate(summary.date),
      icon: Calendar,
      color: "text-violet-400",
    },
    {
      label: "Total Assigned",
      value: summary.total,
      icon: Circle,
      color: "text-zinc-400",
    },
    {
      label: "Completed",
      value: summary.completed,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      label: "Pending",
      value: summary.pending,
      icon: Clock,
      color: "text-zinc-500",
    },
    {
      label: "In Progress",
      value: summary.inProgress,
      icon: Loader2,
      color: "text-blue-400",
    },
    {
      label: "Blocked",
      value: summary.blocked,
      icon: OctagonAlert,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-medium text-zinc-500">{card.label}</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">{card.value}</p>
            </div>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

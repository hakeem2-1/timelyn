"use client";

import { useApp } from "@/context/AppProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

function BarChart({
  data,
  valueKey,
  labelKey,
  color = "bg-violet-500",
  maxValue,
}: {
  data: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  color?: string;
  maxValue?: number;
}) {
  const max = maxValue ?? Math.max(...data.map((d) => Number(d[valueKey])));
  return (
    <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
      {data.map((item, i) => {
        const value = Number(item[valueKey]);
        const height = max > 0 ? (value / max) * 100 : 0;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">{value}</span>
            <div className="relative flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-md ${color} opacity-80 transition-all hover:opacity-100`}
                style={{ height: `${height}%`, minHeight: value > 0 ? "4px" : "0" }}
              />
            </div>
            <span className="text-xs text-zinc-500">{String(item[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

function DualBarChart({
  data,
}: {
  data: { week: string; completed: number; created: number }[];
}) {
  const max = Math.max(...data.flatMap((d) => [d.completed, d.created]));
  return (
    <div className="flex h-48 items-end justify-between gap-3">
      {data.map((item) => (
        <div key={item.week} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end justify-center gap-1">
            <div
              className="w-3 rounded-t bg-violet-500 sm:w-4"
              style={{
                height: `${(item.completed / max) * 100}%`,
                minHeight: item.completed > 0 ? "4px" : "0",
              }}
            />
            <div
              className="w-3 rounded-t bg-zinc-600 sm:w-4"
              style={{
                height: `${(item.created / max) * 100}%`,
                minHeight: item.created > 0 ? "4px" : "0",
              }}
            />
          </div>
          <span className="text-xs text-zinc-500">{item.week}</span>
        </div>
      ))}
      <div className="absolute hidden" />
    </div>
  );
}

export function ProductivityChart() {
  const { analytics } = useApp();
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-zinc-100">Productivity Score</h3>
        <p className="mt-0.5 text-sm text-zinc-500">Daily team average</p>
      </CardHeader>
      <CardContent>
        <BarChart
          data={analytics.productivityByDay}
          valueKey="score"
          labelKey="day"
          color="bg-violet-500"
          maxValue={100}
        />
      </CardContent>
    </Card>
  );
}

export function HoursChart() {
  const { analytics } = useApp();
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-zinc-100">Hours Worked</h3>
        <p className="mt-0.5 text-sm text-zinc-500">Total team hours per day</p>
      </CardHeader>
      <CardContent>
        <BarChart
          data={analytics.hoursByDay}
          valueKey="hours"
          labelKey="day"
          color="bg-indigo-500"
        />
      </CardContent>
    </Card>
  );
}

export function TaskTrendChart() {
  const { analytics } = useApp();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-100">Task Completion Trends</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Created vs completed per week</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Completed
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-zinc-600" />
              Created
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <DualBarChart data={analytics.taskCompletionTrend} />
      </CardContent>
    </Card>
  );
}

export function AttendanceMetric() {
  const { analytics } = useApp();
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-zinc-100">Attendance Rate</h3>
        <p className="mt-0.5 text-sm text-zinc-500">This month</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-800"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${analytics.attendancePercentage * 2.64} 264`}
              strokeLinecap="round"
              className="text-emerald-500"
            />
          </svg>
          <span className="absolute text-2xl font-semibold text-zinc-100">
            {analytics.attendancePercentage}%
          </span>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Above 90% target</p>
      </CardContent>
    </Card>
  );
}

export function TeamPerformance() {
  const { analytics } = useApp();
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-zinc-100">Team Performance</h3>
        <p className="mt-0.5 text-sm text-zinc-500">By department</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {analytics.teamPerformance.map((team) => (
          <div key={team.department} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">{team.department}</span>
              <span className="font-medium text-zinc-200">{team.score}%</span>
            </div>
            <ProgressBar
              value={team.score}
              color={team.score >= 90 ? "emerald" : team.score >= 85 ? "violet" : "amber"}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

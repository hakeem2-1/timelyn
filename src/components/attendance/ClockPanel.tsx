"use client";

import { Coffee, LogIn, LogOut, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export function ClockPanel() {
  const { session, clockIn, clockOut, breakStart, breakEnd, getEmployeeById, currentEmployeeId } =
    useApp();
  const employee = getEmployeeById(currentEmployeeId);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-zinc-100">Time Clock</h3>
        <p className="mt-0.5 text-sm text-zinc-500">
          {employee?.name} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              {now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
            {session.clockInTime && (
              <p className="mt-2 text-sm text-zinc-500">
                Clocked in at {formatTime(session.clockInTime)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              session.onBreak
                ? "bg-amber-400"
                : session.clockedIn
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
            }`}
          />
          <span className="text-sm text-zinc-400">
            {session.onBreak
              ? "On Break"
              : session.clockedIn
                ? "Working"
                : "Not Clocked In"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            size="lg"
            onClick={clockIn}
            disabled={session.clockedIn}
            className="flex-col gap-1 py-4"
          >
            <LogIn className="h-5 w-5" />
            Clock In
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={clockOut}
            disabled={!session.clockedIn || session.onBreak}
            className="flex-col gap-1 py-4"
          >
            <LogOut className="h-5 w-5" />
            Clock Out
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={breakStart}
            disabled={!session.clockedIn || session.onBreak}
            className="flex-col gap-1 py-4"
          >
            <Coffee className="h-5 w-5" />
            Break Start
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={breakEnd}
            disabled={!session.onBreak}
            className="flex-col gap-1 py-4"
          >
            <PlayCircle className="h-5 w-5" />
            Break End
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

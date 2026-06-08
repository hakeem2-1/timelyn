"use client";

import { Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface TaskTimerProps {
  taskId: string;
  actualHours: number;
  onHoursUpdate: (hours: number) => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TaskTimer({ taskId, actualHours, onHoursUpdate }: TaskTimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const baseHoursRef = useRef(actualHours);

  useEffect(() => {
    baseHoursRef.current = actualHours;
  }, [actualHours]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleStop = useCallback(() => {
    setRunning(false);
    const addedHours = elapsed / 3600;
    const newTotal = Math.round((baseHoursRef.current + addedHours) * 100) / 100;
    onHoursUpdate(newTotal);
    setElapsed(0);
  }, [elapsed, onHoursUpdate]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-1">
      <span className="font-mono text-xs text-violet-300">
        {formatElapsed(elapsed)}
      </span>
      {!running ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRunning(true)}
          className="h-6 w-6 p-0"
          aria-label={`Start timer for task ${taskId}`}
        >
          <Play className="h-3 w-3" />
        </Button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRunning(false)}
            className="h-6 w-6 p-0"
            aria-label="Pause timer"
          >
            <Pause className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStop}
            className="h-6 w-6 p-0 text-red-400"
            aria-label="Stop and save timer"
          >
            <Square className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}

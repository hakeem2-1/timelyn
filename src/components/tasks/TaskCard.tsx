"use client";

import { Calendar, Clock, User } from "lucide-react";
import type { Employee, Task } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { TaskTimer } from "./TaskTimer";

const priorityVariant: Record<
  Task["priority"],
  "default" | "info" | "warning" | "danger"
> = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

const statusVariant: Record<
  Task["status"],
  "default" | "info" | "warning" | "success" | "purple"
> = {
  todo: "default",
  "in-progress": "info",
  review: "purple",
  done: "success",
};

const statusLabel: Record<Task["status"], string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

interface TaskCardProps {
  task: Task;
  assignee?: Employee;
  onStatusChange: (status: Task["status"]) => void;
  onHoursUpdate: (hours: number) => void;
}

export function TaskCard({
  task,
  assignee,
  onStatusChange,
  onHoursUpdate,
}: TaskCardProps) {
  return (
    <Card hover>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-zinc-100">{task.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
              {task.description}
            </p>
          </div>
          <Badge variant={priorityVariant[task.priority]}>
            {task.priority}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[task.status]}>
            {statusLabel[task.status]}
          </Badge>
          {assignee && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <User className="h-3 w-3" />
              {assignee.name}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            {task.actualHours}h / {task.estimatedHours}h
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-3">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as Task["status"])}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 focus:border-violet-500/50 focus:outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <TaskTimer
            taskId={task.id}
            actualHours={task.actualHours}
            onHoursUpdate={onHoursUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { ArrowLeft, Calendar, Clock, Pencil, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { AppShell } from "@/components/layout/AppShell";
import { CompletionNote } from "@/components/tasks/CompletionNote";
import { TaskComments } from "@/components/tasks/TaskComments";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskTimer } from "@/components/tasks/TaskTimer";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";
import type { TaskStatus } from "@/types";

const priorityVariant = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "danger",
} as const;

const statusVariant = {
  todo: "default",
  "in-progress": "info",
  review: "purple",
  done: "success",
} as const;

const statusLabel: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getTaskById,
    getEmployeeById,
    updateTaskStatus,
    updateTaskHours,
    deleteTask,
    canEditTask,
    canUpdateTaskFields,
    canDeleteTask,
  } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const task = getTaskById(id);
  const assignee = task ? getEmployeeById(task.assigneeId) : undefined;

  if (!task) {
    return (
      <AppShell title="Task Not Found" subtitle="">
        <div className="py-12 text-center">
          <p className="text-zinc-500">This task does not exist.</p>
          <Link href="/tasks" className="mt-4 inline-block text-sm text-violet-400 hover:underline">
            ← Back to tasks
          </Link>
        </div>
      </AppShell>
    );
  }

  const canEdit = canEditTask(task.id);
  const canManage = canUpdateTaskFields(task.id);
  const hoursProgress =
    task.estimatedHours > 0
      ? Math.min(100, (task.actualHours / task.estimatedHours) * 100)
      : 0;

  const handleDelete = () => {
    deleteTask(task.id);
    router.push("/tasks");
  };

  return (
    <AppShell title={task.title} subtitle={statusLabel[task.status]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tasks
          </Link>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="space-y-5 pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                  <Badge variant={statusVariant[task.status]}>
                    {statusLabel[task.status]}
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed text-zinc-400">{task.description}</p>

                {canEdit && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/60 pt-4">
                    <label className="text-xs text-zinc-500">Status</label>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateTaskStatus(task.id, e.target.value as TaskStatus)
                      }
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 focus:border-violet-500/50 focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                    <TaskTimer
                      taskId={task.id}
                      actualHours={task.actualHours}
                      onHoursUpdate={(h) => updateTaskHours(task.id, h)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {canEdit && <TaskComments task={task} />}
            {canEdit && <CompletionNote task={task} />}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Assignee
                  </p>
                  {assignee ? (
                    <Link
                      href={`/employees/${assignee.id}`}
                      className="mt-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-800/50"
                    >
                      <Avatar initials={assignee.avatar} />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{assignee.name}</p>
                        <p className="text-xs text-zinc-500">{assignee.department}</p>
                      </div>
                    </Link>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">Unassigned</p>
                  )}
                </div>

                <div className="space-y-3 border-t border-zinc-800/60 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Due date
                    </span>
                    <span className="text-zinc-300">{formatDate(task.dueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      Hours
                    </span>
                    <span className="text-zinc-300">
                      {task.actualHours}h / {task.estimatedHours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <User className="h-3.5 w-3.5" />
                      Comments
                    </span>
                    <span className="text-zinc-300">{task.comments.length}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-800/60 pt-4">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Time tracked</span>
                    <span>{Math.round(hoursProgress)}%</span>
                  </div>
                  <ProgressBar value={hoursProgress} color="violet" />
                </div>

                {task.completedAt && (
                  <p className="border-t border-zinc-800/60 pt-4 text-xs text-zinc-500">
                    Completed {formatDate(task.completedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
        <TaskForm
          task={task}
          onSuccess={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen && canDeleteTask(task.id)}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </AppShell>
  );
}

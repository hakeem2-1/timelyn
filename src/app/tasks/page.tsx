"use client";

import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { filterTasks } from "@/lib/filters";
import type { Task, TaskPriority, TaskStatus } from "@/types";

function TasksContent() {
  const {
    visibleTasks,
    employees,
    getEmployeeById,
    updateTaskStatus,
    updateTaskHours,
    deleteTask,
    isAdmin,
    currentEmployeeId,
    canCreateTask,
    canEditTask,
    canUpdateTaskFields,
    canDeleteTask,
  } = useApp();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [assigneeId, setAssigneeId] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(
    () =>
      filterTasks(visibleTasks, {
        search,
        status,
        priority,
        assigneeId: isAdmin ? assigneeId : currentEmployeeId,
      }),
    [visibleTasks, search, status, priority, assigneeId, isAdmin, currentEmployeeId]
  );

  const counts = useMemo(
    () => ({
      all: visibleTasks.length,
      todo: visibleTasks.filter((t) => t.status === "todo").length,
      "in-progress": visibleTasks.filter((t) => t.status === "in-progress").length,
      review: visibleTasks.filter((t) => t.status === "review").length,
      done: visibleTasks.filter((t) => t.status === "done").length,
    }),
    [visibleTasks]
  );

  const tabs: { key: TaskStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "todo", label: "To Do" },
    { key: "in-progress", label: "In Progress" },
    { key: "review", label: "Review" },
    { key: "done", label: "Done" },
  ];

  const taskToDelete = deleteId ? visibleTasks.find((t) => t.id === deleteId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatus(tab.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  status === tab.key
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-zinc-600">{counts[tab.key]}</span>
              </button>
            ))}
          </div>
          {canCreateTask && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 sm:min-w-64">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority | "all")}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {isAdmin && (
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300 focus:outline-none"
              >
                <option value="all">All Assignees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={
            isAdmin
              ? "Create a task or adjust your filters."
              : "You have no tasks matching these filters."
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={getEmployeeById(task.assigneeId)}
              canEdit={canEditTask(task.id)}
              canManage={canUpdateTaskFields(task.id)}
              onStatusChange={(s) => updateTaskStatus(task.id, s)}
              onHoursUpdate={(h) => updateTaskHours(task.id, h)}
              onEdit={() => setEditTask(task)}
              onDelete={() => setDeleteId(task.id)}
            />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task">
        <TaskForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        title="Edit Task"
      >
        {editTask && (
          <TaskForm
            task={editTask}
            onSuccess={() => setEditTask(null)}
            onCancel={() => setEditTask(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId && canDeleteTask(deleteId ?? "")}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteTask(deleteId)}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}

export default function TasksPage() {
  const { isAdmin } = useApp();
  return (
    <AppShell
      title="Tasks"
      subtitle={isAdmin ? "Track and manage team tasks" : "Your assigned tasks"}
    >
      <TasksContent />
    </AppShell>
  );
}

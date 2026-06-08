"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { TaskStatus } from "@/types";

function TasksContent() {
  const { tasks, getEmployeeById, updateTaskStatus, updateTaskHours } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      review: tasks.filter((t) => t.status === "review").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  );

  const tabs: { key: TaskStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "todo", label: "To Do" },
    { key: "in-progress", label: "In Progress" },
    { key: "review", label: "Review" },
    { key: "done", label: "Done" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-zinc-600">
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            assignee={getEmployeeById(task.assigneeId)}
            onStatusChange={(status) => updateTaskStatus(task.id, status)}
            onHoursUpdate={(hours) => updateTaskHours(task.id, hours)}
          />
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          onSuccess={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default function TasksPage() {
  return (
    <AppShell title="Tasks" subtitle="Track and manage team tasks">
      <TasksContent />
    </AppShell>
  );
}

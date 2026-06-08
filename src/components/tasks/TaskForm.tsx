"use client";

import { useState } from "react";
import type { CreateTaskInput, TaskPriority } from "@/types";
import { useApp } from "@/context/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface TaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const { employees, createTask } = useApp();
  const [form, setForm] = useState<CreateTaskInput>({
    title: "",
    description: "",
    assigneeId: employees[0]?.id ?? "",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    estimatedHours: 4,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    createTask(form);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Enter task title"
        required
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-400">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the task..."
          rows={3}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        />
      </div>
      <Select
        label="Assign Employee"
        value={form.assigneeId}
        onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
        options={employees.map((e) => ({ value: e.id, label: e.name }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value as TaskPriority })
          }
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />
        <Input
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
      </div>
      <Input
        label="Estimated Hours"
        type="number"
        min={0.5}
        step={0.5}
        value={form.estimatedHours}
        onChange={(e) =>
          setForm({ ...form, estimatedHours: parseFloat(e.target.value) || 0 })
        }
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Task</Button>
      </div>
    </form>
  );
}

"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { SheetTask, SheetTaskStatus } from "@/types";
import { useApp } from "@/context/AppProvider";
import { AdminTaskFormModal } from "./AdminTaskFormModal";
import { SheetTaskRow } from "./SheetTaskRow";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";

interface DailySheetViewProps {
  employeeId: string;
  date: string;
  mode: "admin" | "employee" | "readonly";
}

export function DailySheetView({ employeeId, date, mode }: DailySheetViewProps) {
  const {
    getSheet,
    updateSheetTaskEmployee,
    deleteSheetTask,
    canManageSheet,
  } = useApp();

  const sheet = getSheet(employeeId, date);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<SheetTask | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tasks = sheet?.tasks ?? [];
  const canManage = mode === "admin" && canManageSheet(employeeId, date);
  const taskToDelete = tasks.find((t) => t.id === deleteId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} on sheet
        </h3>
        {canManage && (
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Assign Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks on this sheet"
          description={
            canManage
              ? "Assign today's tasks or bugs for this employee."
              : "Your admin hasn't assigned tasks for this date yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <SheetTaskRow
              key={task.id}
              task={task}
              mode={mode}
              onStatusChange={(status) =>
                updateSheetTaskEmployee(employeeId, date, task.id, { status })
              }
              onEmployeeNotesChange={(employeeNotes) =>
                updateSheetTaskEmployee(employeeId, date, task.id, { employeeNotes })
              }
              onCompletionNoteChange={(completionNote) =>
                updateSheetTaskEmployee(employeeId, date, task.id, { completionNote })
              }
              onEdit={canManage ? () => setEditTask(task) : undefined}
              onDelete={canManage ? () => setDeleteId(task.id) : undefined}
            />
          ))}
        </div>
      )}

      <AdminTaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        employeeId={employeeId}
        date={date}
      />

      <AdminTaskFormModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        employeeId={employeeId}
        date={date}
        task={editTask ?? undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteSheetTask(employeeId, date, deleteId)}
        title="Delete Task"
        description={`Remove "${taskToDelete?.title}" from this sheet?`}
        confirmLabel="Delete"
      />
    </div>
  );
}

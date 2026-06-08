"use client";

import { ExternalLink, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { SheetTask, SheetTaskStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const rarityVariant = {
  common: "default",
  uncommon: "info",
  rare: "purple",
  critical: "danger",
} as const;

const urgencyVariant = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "danger",
} as const;

const statusVariant = {
  pending: "default",
  in_progress: "info",
  completed: "success",
  blocked: "warning",
} as const;

const statusLabel: Record<SheetTaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

interface SheetTaskRowProps {
  task: SheetTask;
  mode: "admin" | "employee" | "readonly";
  onStatusChange?: (status: SheetTaskStatus) => void;
  onEmployeeNotesChange?: (notes: string) => void;
  onCompletionNoteChange?: (note: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SheetTaskRow({
  task,
  mode,
  onStatusChange,
  onEmployeeNotesChange,
  onCompletionNoteChange,
  onEdit,
  onDelete,
}: SheetTaskRowProps) {
  const [showImage, setShowImage] = useState(false);
  const [employeeNotes, setEmployeeNotes] = useState(task.employeeNotes);
  const [completionNote, setCompletionNote] = useState(task.completionNote);

  const canEditEmployee = mode === "employee";
  const canManage = mode === "admin";

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 font-mono text-sm font-semibold text-violet-400">
            {task.taskNumber}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-zinc-100">{task.title}</h4>
            <p className="mt-1 text-sm text-zinc-500">{task.description}</p>
            {task.adminNotes && (
              <p className="mt-2 rounded-md bg-violet-500/5 px-2.5 py-1.5 text-xs text-violet-300/90 ring-1 ring-violet-500/10">
                Admin: {task.adminNotes}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={rarityVariant[task.rarity]}>{task.rarity}</Badge>
          <Badge variant={urgencyVariant[task.urgency]}>{task.urgency}</Badge>
          <Badge variant={statusVariant[task.status]}>{statusLabel[task.status]}</Badge>
          {canManage && (
            <div className="ml-1 flex gap-1">
              <button
                onClick={onEdit}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-violet-400"
                aria-label="Edit task"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                aria-label="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {task.referenceImageUrl && (
        <div className="mt-3">
          <button
            onClick={() => setShowImage((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-violet-400"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {showImage ? "Hide reference" : "View reference image"}
            <ExternalLink className="h-3 w-3" />
          </button>
          {showImage && (
            <div className="mt-2 overflow-hidden rounded-lg border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={task.referenceImageUrl}
                alt={`Reference for ${task.title}`}
                className="max-h-48 w-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 border-t border-zinc-800/60 pt-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Employee Notes</label>
          {canEditEmployee ? (
            <textarea
              value={employeeNotes}
              onChange={(e) => setEmployeeNotes(e.target.value)}
              onBlur={() => onEmployeeNotesChange?.(employeeNotes)}
              placeholder="Add progress notes..."
              rows={2}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none"
            />
          ) : (
            <p className={cn("text-sm", task.employeeNotes ? "text-zinc-400" : "text-zinc-600")}>
              {task.employeeNotes || "—"}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Completion Note</label>
          {canEditEmployee ? (
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              onBlur={() => onCompletionNoteChange?.(completionNote)}
              placeholder="Summary when done..."
              rows={2}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none"
            />
          ) : (
            <p className={cn("text-sm", task.completionNote ? "text-zinc-400" : "text-zinc-600")}>
              {task.completionNote || "—"}
            </p>
          )}
        </div>
      </div>

      {(canEditEmployee || mode === "readonly" || mode === "admin") && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canEditEmployee && onStatusChange ? (
            <>
              <span className="text-xs text-zinc-500">Status:</span>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(e.target.value as SheetTaskStatus)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </>
          ) : (
            <span className="text-xs text-zinc-600">
              Status: {statusLabel[task.status]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

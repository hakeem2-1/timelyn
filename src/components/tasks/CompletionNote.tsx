"use client";

import { FileText } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Task } from "@/types";

interface CompletionNoteProps {
  task: Task;
}

export function CompletionNote({ task }: CompletionNoteProps) {
  const { setTaskCompletionNote, updateTaskStatus } = useApp();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(task.completionNote ?? "");

  const handleSave = () => {
    setTaskCompletionNote(task.id, note.trim());
    if (task.status !== "done" && note.trim()) {
      updateTaskStatus(task.id, "done", note.trim());
    }
    setEditing(false);
  };

  if (task.status !== "done" && !editing) {
    return (
      <Card>
        <CardContent className="py-4">
          <button
            onClick={() => setEditing(true)}
            className="flex w-full items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-violet-400"
          >
            <FileText className="h-4 w-4" />
            Add completion note when marking done...
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" />
          <h3 className="font-semibold text-zinc-100">Completion Note</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {editing || !task.completionNote ? (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Summarize what was delivered, blockers resolved, or handoff notes..."
              rows={4}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
            <div className="flex justify-end gap-2">
              {task.completionNote && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={!note.trim()}>
                Save Note
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-zinc-300">{task.completionNote}</p>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit note
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { CreateSheetTaskInput, SheetRarity, SheetTask, SheetUrgency } from "@/types";
import { useApp } from "@/context/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

interface AdminTaskFormModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  date: string;
  task?: SheetTask;
}

export function AdminTaskFormModal({
  open,
  onClose,
  employeeId,
  date,
  task,
}: AdminTaskFormModalProps) {
  const { createSheetTask, updateSheetTaskAdmin } = useApp();
  const isEdit = !!task;

  const [form, setForm] = useState<CreateSheetTaskInput>({
    title: "",
    description: "",
    adminNotes: "",
    referenceImageUrl: "",
    rarity: "common",
    urgency: "medium",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      title: task?.title ?? "",
      description: task?.description ?? "",
      adminNotes: task?.adminNotes ?? "",
      referenceImageUrl: task?.referenceImageUrl ?? "",
      rarity: task?.rarity ?? "common",
      urgency: task?.urgency ?? "medium",
    });
  }, [open, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (isEdit && task) {
      updateSheetTaskAdmin(employeeId, date, task.id, form);
    } else {
      createSheetTask(employeeId, date, form);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Sheet Task" : "Assign Task / Bug"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-400">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/50 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-400">Admin Notes</label>
          <textarea
            value={form.adminNotes}
            onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
            rows={2}
            placeholder="Instructions, links, context..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/50 focus:outline-none"
          />
        </div>
        <Input
          label="Reference Image URL"
          value={form.referenceImageUrl ?? ""}
          onChange={(e) => setForm({ ...form, referenceImageUrl: e.target.value })}
          placeholder="https://..."
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Rarity"
            value={form.rarity}
            onChange={(e) => setForm({ ...form, rarity: e.target.value as SheetRarity })}
            options={[
              { value: "common", label: "Common" },
              { value: "uncommon", label: "Uncommon" },
              { value: "rare", label: "Rare" },
              { value: "critical", label: "Critical" },
            ]}
          />
          <Select
            label="Urgency"
            value={form.urgency}
            onChange={(e) => setForm({ ...form, urgency: e.target.value as SheetUrgency })}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save" : "Assign Task"}</Button>
        </div>
      </form>
    </Modal>
  );
}

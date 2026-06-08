import type {
  DailySheet,
  Employee,
  LegacyTask,
  SheetSummary,
  SheetTask,
  SheetTaskStatus,
  SheetRarity,
  SheetUrgency,
} from "@/types";
import { generateId, getTodayISO } from "@/lib/utils";

export function computeSheetSummary(sheet: DailySheet | undefined, date?: string): SheetSummary {
  const tasks = sheet?.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const total = tasks.length;

  return {
    date: sheet?.date ?? date ?? getTodayISO(),
    total,
    completed,
    pending,
    inProgress,
    blocked,
    productivity: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

function mapLegacyStatus(status?: string): SheetTaskStatus {
  switch (status) {
    case "done":
      return "completed";
    case "in-progress":
    case "review":
      return "in_progress";
    case "blocked":
      return "blocked";
    default:
      return "pending";
  }
}

function mapLegacyUrgency(priority?: string): SheetUrgency {
  switch (priority) {
    case "urgent":
      return "urgent";
    case "high":
      return "high";
    case "low":
      return "low";
    default:
      return "medium";
  }
}

function mapLegacyRarity(priority?: string): SheetRarity {
  switch (priority) {
    case "urgent":
      return "critical";
    case "high":
      return "rare";
    case "medium":
      return "uncommon";
    default:
      return "common";
  }
}

export function migrateLegacyTasksToSheets(
  tasks: LegacyTask[],
  employeeIds: string[]
): DailySheet[] {
  const sheetMap = new Map<string, DailySheet>();

  for (const task of tasks) {
    if (!employeeIds.includes(task.assigneeId)) continue;

    const date = task.dueDate?.split("T")[0] ?? task.createdAt?.split("T")[0] ?? getTodayISO();
    const key = `${task.assigneeId}:${date}`;

    if (!sheetMap.has(key)) {
      const now = new Date().toISOString();
      sheetMap.set(key, {
        id: generateId(),
        employeeId: task.assigneeId,
        date,
        tasks: [],
        todDraft: "",
        eodDraft: "",
        createdAt: now,
        updatedAt: now,
      });
    }

    const sheet = sheetMap.get(key)!;
    const now = new Date().toISOString();
    const sheetTask: SheetTask = {
      id: task.id,
      taskNumber: sheet.tasks.length + 1,
      title: task.title,
      description: task.description,
      adminNotes: "",
      rarity: mapLegacyRarity(task.priority),
      urgency: mapLegacyUrgency(task.priority),
      status: mapLegacyStatus(task.status),
      employeeNotes: "",
      completionNote: task.completionNote ?? "",
      assignedAt: task.createdAt ?? now,
      updatedAt: now,
      completedAt: task.completedAt,
    };
    sheet.tasks.push(sheetTask);
    sheet.updatedAt = now;
  }

  return Array.from(sheetMap.values());
}

export function generateTodPlaceholder(sheet: DailySheet, employee: Employee): string {
  const pending = sheet.tasks.filter((t) => t.status !== "completed");
  const lines = [
    `TOD — ${employee.name} — ${sheet.date}`,
    "",
    `Good morning team. Today I plan to focus on ${pending.length} assigned item(s):`,
    "",
    ...pending.map(
      (t) =>
        `• #${t.taskNumber} ${t.title} [${t.urgency} urgency, ${t.rarity}] — ${t.description.slice(0, 80)}${t.description.length > 80 ? "…" : ""}`
    ),
    "",
    pending.length === 0
      ? "No open items on today's sheet. Available for ad-hoc support."
      : "Will provide EOD update on completion status and any blockers.",
  ];
  return lines.join("\n");
}

export function generateEodPlaceholder(sheet: DailySheet, employee: Employee): string {
  const completed = sheet.tasks.filter((t) => t.status === "completed");
  const blocked = sheet.tasks.filter((t) => t.status === "blocked");
  const inProgress = sheet.tasks.filter((t) => t.status === "in_progress");

  const lines = [
    `EOD — ${employee.name} — ${sheet.date}`,
    "",
    `Completed (${completed.length}):`,
    ...(completed.length
      ? completed.map(
          (t) =>
            `• #${t.taskNumber} ${t.title}${t.completionNote ? ` — ${t.completionNote}` : ""}`
        )
      : ["• None"]),
    "",
    `In Progress (${inProgress.length}):`,
    ...(inProgress.length
      ? inProgress.map((t) => `• #${t.taskNumber} ${t.title}${t.employeeNotes ? ` — ${t.employeeNotes}` : ""}`)
      : ["• None"]),
    "",
    `Blocked (${blocked.length}):`,
    ...(blocked.length
      ? blocked.map((t) => `• #${t.taskNumber} ${t.title}${t.employeeNotes ? ` — ${t.employeeNotes}` : ""}`)
      : ["• None"]),
    "",
    `Productivity: ${computeSheetSummary(sheet).productivity}% of assigned tasks completed.`,
  ];
  return lines.join("\n");
}

export function getSheetDatesForEmployee(
  sheets: DailySheet[],
  employeeId: string
): string[] {
  return [...new Set(sheets.filter((s) => s.employeeId === employeeId).map((s) => s.date))].sort(
    (a, b) => b.localeCompare(a)
  );
}

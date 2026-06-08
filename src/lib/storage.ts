import {
  employees as mockEmployees,
  initialActivity,
  initialAttendance,
  initialTasks,
} from "@/data/mock";
import { getTodayISO } from "@/lib/utils";
import type {
  ActivityItem,
  AttendanceRecord,
  AttendanceSession,
  Employee,
  PersistedState,
  Task,
} from "@/types";

export const STORAGE_KEY = "timelyn-app-state";
export const STORAGE_VERSION = 2;
const DEFAULT_EMPLOYEE_ID = "emp-1";

function migrateTask(task: Task): Task {
  return {
    ...task,
    comments: task.comments ?? [],
  };
}

function buildDefaultSession(
  attendance: AttendanceRecord[],
  employeeId: string
): AttendanceSession {
  const today = getTodayISO();
  const record = attendance.find(
    (a) => a.employeeId === employeeId && a.date === today
  );
  return {
    clockedIn: !!record?.clockIn && !record?.clockOut,
    onBreak: !!record?.breakStart && !record?.breakEnd,
    clockInTime: record?.clockIn ?? null,
    breakStartTime: record?.breakStart ?? null,
    todayRecordId: record?.id ?? null,
  };
}

export function getDefaultState(): PersistedState {
  return {
    version: STORAGE_VERSION,
    employees: mockEmployees,
    tasks: initialTasks.map(migrateTask),
    attendance: initialAttendance,
    activity: initialActivity,
    session: buildDefaultSession(initialAttendance, DEFAULT_EMPLOYEE_ID),
    role: "admin",
    currentEmployeeId: DEFAULT_EMPLOYEE_ID,
  };
}

function isValidPersistedState(value: unknown): value is PersistedState {
  if (!value || typeof value !== "object") return false;
  const state = value as PersistedState;
  return (
    typeof state.version === "number" &&
    Array.isArray(state.tasks) &&
    Array.isArray(state.attendance) &&
    Array.isArray(state.activity) &&
    typeof state.session === "object" &&
    (state.role === "admin" || state.role === "employee") &&
    typeof state.currentEmployeeId === "string"
  );
}

function migratePersistedState(parsed: PersistedState): PersistedState {
  const employees: Employee[] =
    Array.isArray(parsed.employees) && parsed.employees.length > 0
      ? parsed.employees
      : mockEmployees;

  const tasks = parsed.tasks.map(migrateTask);
  const session =
    parsed.session ??
    buildDefaultSession(parsed.attendance, parsed.currentEmployeeId);

  const currentEmployeeId = employees.some((e) => e.id === parsed.currentEmployeeId)
    ? parsed.currentEmployeeId
    : employees[0]?.id ?? DEFAULT_EMPLOYEE_ID;

  return {
    ...parsed,
    version: STORAGE_VERSION,
    employees,
    tasks,
    session: buildDefaultSession(parsed.attendance, currentEmployeeId),
    currentEmployeeId,
  };
}

export function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed: unknown = JSON.parse(raw);
    if (!isValidPersistedState(parsed)) return getDefaultState();

    return migratePersistedState(parsed);
  } catch {
    return getDefaultState();
  }
}

export function savePersistedState(state: PersistedState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, version: STORAGE_VERSION })
    );
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
}

export function clearPersistedState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

import { employees as mockEmployees, initialActivity, seedDailySheets } from "@/data/mock";
import { migrateLegacyTasksToSheets } from "@/lib/sheets";
import type {
  ActivityItem,
  AttendanceRecord,
  DailySheet,
  Employee,
  LegacyTask,
  PersistedState,
} from "@/types";

export const STORAGE_KEY = "timelyn-app-state";
export const STORAGE_VERSION = 3;
const DEFAULT_EMPLOYEE_ID = "emp-1";

interface LegacyPersistedV2 {
  version: number;
  employees?: Employee[];
  attendance?: AttendanceRecord[];
  tasks?: LegacyTask[];
  dailySheets?: DailySheet[];
  activity?: ActivityItem[];
  role?: PersistedState["role"];
  currentEmployeeId?: string;
}

export function getDefaultState(): PersistedState {
  return {
    version: STORAGE_VERSION,
    employees: mockEmployees,
    dailySheets: seedDailySheets,
    attendance: [],
    activity: initialActivity,
    role: "admin",
    currentEmployeeId: DEFAULT_EMPLOYEE_ID,
    
  };
}

function isLegacyState(value: unknown): value is LegacyPersistedV2 {
  return !!value && typeof value === "object";
}

function migrateEmployees(parsed: LegacyPersistedV2): Employee[] {
  if (Array.isArray(parsed.employees) && parsed.employees.length > 0) {
    return parsed.employees.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.role,
      department: e.department,
      avatar: e.avatar,
      status: e.status,
    }));
  }
  return mockEmployees;
}

function migrateSheets(parsed: LegacyPersistedV2, employees: Employee[]): DailySheet[] {
  if (Array.isArray(parsed.dailySheets) && parsed.dailySheets.length > 0) {
    return parsed.dailySheets;
  }

  if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
    const migrated = migrateLegacyTasksToSheets(
      parsed.tasks,
      employees.map((e) => e.id)
    );
    if (migrated.length > 0) return migrated;
  }

  return seedDailySheets;
}

function migratePersistedState(parsed: LegacyPersistedV2): PersistedState {
  const employees = migrateEmployees(parsed);
  const dailySheets = migrateSheets(parsed, employees);
  const currentEmployeeId = employees.some((e) => e.id === parsed.currentEmployeeId)
    ? (parsed.currentEmployeeId as string)
    : employees[0]?.id ?? DEFAULT_EMPLOYEE_ID;

  return {
    version: STORAGE_VERSION,
    employees,
    dailySheets,
    activity: Array.isArray(parsed.activity) ? parsed.activity : initialActivity,
    role: parsed.role === "employee" ? "employee" : "admin",
    currentEmployeeId,
    attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
  };
}

export function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed: unknown = JSON.parse(raw);
    if (!isLegacyState(parsed)) return getDefaultState();

    if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.dailySheets)) {
      return migratePersistedState(parsed);
    }

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
    // Quota exceeded or private browsing
  }
}

export function clearPersistedState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

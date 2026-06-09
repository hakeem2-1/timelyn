export type EmployeeStatus = "active" | "away" | "offline" | "on-leave";
export type UserRole = "admin" | "employee";

export type SheetTaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type SheetRarity = "common" | "uncommon" | "rare" | "critical";
export type SheetUrgency = "low" | "medium" | "high" | "urgent";
export type AttendanceStatus =
  | "not_started"
  | "working"
  | "on_break"
  | "present"
  | "late"
  | "half_day"
  | "absent";

export type BreakEntry = {
  id: string;
  startTime: string;
  endTime?: string;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  requiredMinutes: number;
  clockIn?: string;
  clockOut?: string;
  breaks: BreakEntry[];
  breakMinutes: number;
  workedMinutes: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  status: EmployeeStatus;
}

export interface SheetTask {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  adminNotes: string;
  referenceImageUrl?: string;
  rarity: SheetRarity;
  urgency: SheetUrgency;
  status: SheetTaskStatus;
  employeeNotes: string;
  completionNote: string;
  assignedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DailySheet {
  id: string;
  employeeId: string;
  date: string;
  tasks: SheetTask[];
  todDraft: string;
  eodDraft: string;
  createdAt: string;
  updatedAt: string;
}

export interface SheetSummary {
  date: string;
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  blocked: number;
  productivity: number;
}

export interface CreateSheetTaskInput {
  title: string;
  description: string;
  adminNotes: string;
  referenceImageUrl?: string;
  rarity: SheetRarity;
  urgency: SheetUrgency;
}

export interface UpdateSheetTaskAdminInput extends CreateSheetTaskInput {}

export interface UpdateSheetTaskEmployeeInput {
  status?: SheetTaskStatus;
  employeeNotes?: string;
  completionNote?: string;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  role: string;
  department: string;
  status: EmployeeStatus;
}

export interface UpdateEmployeeInput extends CreateEmployeeInput {}

export type ActivityEntityType = "sheet" | "employee" | "task";

export interface ActivityItem {
  id: string;
  type: "sheet" | "task" | "employee" | "milestone";
  message: string;
  employeeName: string;
  employeeId?: string;
  timestamp: string;
  entityId?: string;
  entityType?: ActivityEntityType;
}

export interface PersistedState {
  version: number;
  employees: Employee[];
  dailySheets: DailySheet[];
  activity: ActivityItem[];
  role: UserRole;
  currentEmployeeId: string;
  attendance: AttendanceRecord[];
}

/** @deprecated Legacy shape for v2 migration only */
export interface LegacyTask {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  completedAt?: string;
  completionNote?: string;
}

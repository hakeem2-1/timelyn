export type EmployeeStatus = "active" | "away" | "offline" | "on-leave";

export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type UserRole = "admin" | "employee";

export type AttendanceAction = "clock-in" | "clock-out" | "break-start" | "break-end";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  performanceScore: number;
  avatar: string;
  joinedAt: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  completedAt?: string;
  completionNote?: string;
  comments: TaskComment[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  status: "present" | "absent" | "partial" | "on-break";
}

export type ActivityEntityType = "task" | "employee" | "attendance";

export interface ActivityItem {
  id: string;
  type: "task" | "attendance" | "employee" | "milestone" | "comment";
  message: string;
  employeeName: string;
  employeeId?: string;
  timestamp: string;
  entityId?: string;
  entityType?: ActivityEntityType;
}

export interface GrowthInsight {
  employeeId: string;
  strengths: string[];
  weakAreas: string[];
  consistencyScore: number;
  deadlineAccuracy: number;
  suggestions: string[];
}

export interface AnalyticsData {
  productivityByDay: { day: string; score: number }[];
  hoursByDay: { day: string; hours: number }[];
  taskCompletionTrend: { week: string; completed: number; created: number }[];
  attendancePercentage: number;
  teamPerformance: { department: string; score: number }[];
}

export interface CreateTaskInput {
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
}

export interface UpdateTaskInput {
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  estimatedHours: number;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  performanceScore: number;
  joinedAt: string;
}

export interface UpdateEmployeeInput extends CreateEmployeeInput {}

export interface AttendanceSession {
  clockedIn: boolean;
  onBreak: boolean;
  clockInTime: string | null;
  breakStartTime: string | null;
  todayRecordId: string | null;
}

export interface PersistedState {
  version: number;
  employees: Employee[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  activity: ActivityItem[];
  session: AttendanceSession;
  role: UserRole;
  currentEmployeeId: string;
}

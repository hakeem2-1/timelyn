"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { analyticsData, growthInsights } from "@/data/mock";
import { exportAttendanceCsv } from "@/lib/csv";
import { loadPersistedState, savePersistedState } from "@/lib/storage";
import { generateId, getInitials, getTodayISO } from "@/lib/utils";
import type {
  ActivityItem,
  AnalyticsData,
  AttendanceRecord,
  AttendanceSession,
  CreateEmployeeInput,
  CreateTaskInput,
  Employee,
  GrowthInsight,
  Task,
  TaskStatus,
  UpdateEmployeeInput,
  UpdateTaskInput,
  UserRole,
} from "@/types";

interface AddActivityInput {
  type: ActivityItem["type"];
  message: string;
  employeeName: string;
  employeeId?: string;
  entityId?: string;
  entityType?: ActivityItem["entityType"];
}

interface AppContextValue {
  employees: Employee[];
  tasks: Task[];
  visibleTasks: Task[];
  attendance: AttendanceRecord[];
  visibleAttendance: AttendanceRecord[];
  activity: ActivityItem[];
  growthInsights: GrowthInsight[];
  analytics: AnalyticsData;
  session: AttendanceSession;
  role: UserRole;
  currentEmployeeId: string;
  isAdmin: boolean;
  isHydrated: boolean;
  setRole: (role: UserRole) => void;
  setCurrentEmployeeId: (id: string) => void;
  createEmployee: (input: CreateEmployeeInput) => void;
  updateEmployee: (id: string, input: UpdateEmployeeInput) => void;
  deleteEmployee: (id: string) => void;
  createTask: (input: CreateTaskInput) => void;
  updateTask: (taskId: string, input: UpdateTaskInput) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, completionNote?: string) => void;
  updateTaskHours: (taskId: string, actualHours: number) => void;
  addTaskComment: (taskId: string, text: string) => void;
  setTaskCompletionNote: (taskId: string, note: string) => void;
  clockIn: () => void;
  clockOut: () => void;
  breakStart: () => void;
  breakEnd: () => void;
  exportAttendance: () => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getTaskById: (id: string) => Task | undefined;
  getTasksForEmployee: (employeeId: string) => Task[];
  getAttendanceForEmployee: (employeeId: string) => AttendanceRecord[];
  getGrowthInsight: (employeeId: string) => GrowthInsight | undefined;
  canManageEmployees: boolean;
  canCreateTask: boolean;
  canEditTask: (taskId: string) => boolean;
  canDeleteTask: (taskId: string) => boolean;
  canUpdateTaskFields: (taskId: string) => boolean;
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    tasksCompletedToday: number;
    hoursWorkedToday: number;
    productivityScore: number;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [session, setSession] = useState<AttendanceSession>({
    clockedIn: false,
    onBreak: false,
    clockInTime: null,
    breakStartTime: null,
    todayRecordId: null,
  });
  const [role, setRoleState] = useState<UserRole>("admin");
  const [currentEmployeeId, setCurrentEmployeeIdState] = useState("emp-1");
  const [isHydrated, setIsHydrated] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    const stored = loadPersistedState();
    setEmployees(stored.employees);
    setTasks(stored.tasks);
    setAttendance(stored.attendance);
    setActivity(stored.activity);
    setSession(stored.session);
    setRoleState(stored.role);
    setCurrentEmployeeIdState(stored.currentEmployeeId);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || skipSave.current) {
      skipSave.current = false;
      return;
    }
    savePersistedState({
      version: 2,
      employees,
      tasks,
      attendance,
      activity,
      session,
      role,
      currentEmployeeId,
    });
  }, [employees, tasks, attendance, activity, session, role, currentEmployeeId, isHydrated]);

  const isAdmin = role === "admin";

  const actor = useCallback(
    () => employees.find((e) => e.id === currentEmployeeId),
    [employees, currentEmployeeId]
  );

  const addActivity = useCallback((item: AddActivityInput) => {
    setActivity((prev) =>
      [{ ...item, id: generateId(), timestamp: new Date().toISOString() }, ...prev].slice(0, 50)
    );
  }, []);

  const getEmployeeById = useCallback(
    (id: string) => employees.find((e) => e.id === id),
    [employees]
  );

  const getTaskById = useCallback(
    (id: string) => tasks.find((t) => t.id === id),
    [tasks]
  );

  const getTasksForEmployee = useCallback(
    (employeeId: string) => tasks.filter((t) => t.assigneeId === employeeId),
    [tasks]
  );

  const getAttendanceForEmployee = useCallback(
    (employeeId: string) => attendance.filter((a) => a.employeeId === employeeId),
    [attendance]
  );

  const getGrowthInsight = useCallback(
    (employeeId: string) => growthInsights.find((g) => g.employeeId === employeeId),
    []
  );

  const ownsTask = useCallback(
    (task: Task) => task.assigneeId === currentEmployeeId,
    [currentEmployeeId]
  );

  const canManageEmployees = isAdmin;
  const canCreateTask = isAdmin;

  const canEditTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return false;
      return isAdmin || ownsTask(task);
    },
    [tasks, isAdmin, ownsTask]
  );

  const canDeleteTask = useCallback(
    (taskId: string) => isAdmin && !!tasks.find((t) => t.id === taskId),
    [tasks, isAdmin]
  );

  const canUpdateTaskFields = useCallback(
    (taskId: string) => isAdmin && !!tasks.find((t) => t.id === taskId),
    [tasks, isAdmin]
  );

  const setRole = useCallback(
    (newRole: UserRole) => {
      setRoleState(newRole);
      addActivity({
        type: "employee",
        message: `Switched to ${newRole} view`,
        employeeName: actor()?.name ?? "User",
        employeeId: currentEmployeeId,
      });
    },
    [addActivity, actor, currentEmployeeId]
  );

  const setCurrentEmployeeId = useCallback(
    (id: string) => {
      setCurrentEmployeeIdState(id);
      const today = getTodayISO();
      const record = attendance.find((a) => a.employeeId === id && a.date === today);
      setSession(
        record
          ? {
              clockedIn: !!record.clockIn && !record.clockOut,
              onBreak: !!record.breakStart && !record.breakEnd,
              clockInTime: record.clockIn ?? null,
              breakStartTime: record.breakStart ?? null,
              todayRecordId: record.id,
            }
          : {
              clockedIn: false,
              onBreak: false,
              clockInTime: null,
              breakStartTime: null,
              todayRecordId: null,
            }
      );
    },
    [attendance]
  );

  const visibleTasks = useMemo(() => {
    if (isAdmin) return tasks;
    return tasks.filter((t) => t.assigneeId === currentEmployeeId);
  }, [tasks, isAdmin, currentEmployeeId]);

  const visibleAttendance = useMemo(() => {
    if (isAdmin) return attendance;
    return attendance.filter((a) => a.employeeId === currentEmployeeId);
  }, [attendance, isAdmin, currentEmployeeId]);

  const createEmployee = useCallback(
    (input: CreateEmployeeInput) => {
      if (!isAdmin) return;

      const newEmployee: Employee = {
        id: generateId(),
        ...input,
        avatar: getInitials(input.name),
      };
      setEmployees((prev) => [newEmployee, ...prev]);
      addActivity({
        type: "employee",
        message: `Added employee: ${input.name}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityId: newEmployee.id,
        entityType: "employee",
      });
    },
    [isAdmin, addActivity, actor, currentEmployeeId]
  );

  const updateEmployee = useCallback(
    (id: string, input: UpdateEmployeeInput) => {
      if (!isAdmin) return;

      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, ...input, avatar: getInitials(input.name) }
            : e
        )
      );
      addActivity({
        type: "employee",
        message: `Updated employee: ${input.name}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityId: id,
        entityType: "employee",
      });
    },
    [isAdmin, addActivity, actor, currentEmployeeId]
  );

  const deleteEmployee = useCallback(
    (id: string) => {
      if (!isAdmin) return;

      const employee = getEmployeeById(id);
      if (!employee) return;

      setEmployees((prev) => {
        const remaining = prev.filter((e) => e.id !== id);
        if (currentEmployeeId === id && remaining.length > 0) {
          setCurrentEmployeeIdState(remaining[0].id);
        }
        return remaining;
      });
      setTasks((prev) => prev.filter((t) => t.assigneeId !== id));
      setAttendance((prev) => prev.filter((a) => a.employeeId !== id));

      addActivity({
        type: "employee",
        message: `Removed employee: ${employee.name}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityType: "employee",
      });
    },
    [isAdmin, getEmployeeById, actor, currentEmployeeId]
  );

  const createTask = useCallback(
    (input: CreateTaskInput) => {
      if (!isAdmin) return;

      const newTask: Task = {
        id: generateId(),
        ...input,
        status: "todo",
        actualHours: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      addActivity({
        type: "task",
        message: `Created task: ${input.title}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityId: newTask.id,
        entityType: "task",
      });
    },
    [isAdmin, addActivity, actor, currentEmployeeId]
  );

  const updateTask = useCallback(
    (taskId: string, input: UpdateTaskInput) => {
      if (!isAdmin) return;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const completedAt =
            input.status === "done" && t.status !== "done"
              ? new Date().toISOString()
              : input.status !== "done"
                ? undefined
                : t.completedAt;
          return { ...t, ...input, completedAt };
        })
      );
      addActivity({
        type: "task",
        message: `Updated task: ${input.title}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityId: taskId,
        entityType: "task",
      });
    },
    [isAdmin, addActivity, actor, currentEmployeeId]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      if (!isAdmin) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      addActivity({
        type: "task",
        message: `Deleted task: ${task.title}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityType: "task",
      });
    },
    [isAdmin, tasks, addActivity, actor, currentEmployeeId]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus, completionNote?: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      if (!isAdmin && !ownsTask(task)) return;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status,
            completedAt: status === "done" ? new Date().toISOString() : t.completedAt,
            completionNote:
              status === "done" && completionNote !== undefined
                ? completionNote
                : t.completionNote,
          };
        })
      );
      addActivity({
        type: "task",
        message: `Updated "${task.title}" to ${status.replace("-", " ")}`,
        employeeName: actor()?.name ?? "Unknown",
        employeeId: currentEmployeeId,
        entityId: taskId,
        entityType: "task",
      });
    },
    [tasks, isAdmin, ownsTask, addActivity, actor, currentEmployeeId]
  );

  const updateTaskHours = useCallback(
    (taskId: string, actualHours: number) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      if (!isAdmin && !ownsTask(task)) return;

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, actualHours } : t))
      );
    },
    [tasks, isAdmin, ownsTask]
  );

  const addTaskComment = useCallback(
    (taskId: string, text: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      if (!isAdmin && !ownsTask(task)) return;

      const author = actor();
      const comment = {
        id: generateId(),
        authorId: currentEmployeeId,
        authorName: author?.name ?? "Unknown",
        text,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
        )
      );
      addActivity({
        type: "comment",
        message: `Commented on "${task.title}"`,
        employeeName: author?.name ?? "Unknown",
        employeeId: currentEmployeeId,
        entityId: taskId,
        entityType: "task",
      });
    },
    [tasks, isAdmin, ownsTask, actor, currentEmployeeId, addActivity]
  );

  const setTaskCompletionNote = useCallback(
    (taskId: string, note: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      if (!isAdmin && !ownsTask(task)) return;

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completionNote: note } : t))
      );
    },
    [tasks, isAdmin, ownsTask]
  );

  const updateTodayRecord = useCallback(
    (updates: Partial<AttendanceRecord>) => {
      const today = getTodayISO();
      setAttendance((prev) => {
        const existing = prev.find(
          (a) => a.employeeId === currentEmployeeId && a.date === today
        );
        if (existing) {
          return prev.map((a) =>
            a.id === existing.id ? { ...a, ...updates } : a
          );
        }
        const newRecord: AttendanceRecord = {
          id: generateId(),
          employeeId: currentEmployeeId,
          date: today,
          totalHours: 0,
          status: "present",
          ...updates,
        };
        setSession((s) => ({ ...s, todayRecordId: newRecord.id }));
        return [newRecord, ...prev];
      });
    },
    [currentEmployeeId]
  );

  const clockIn = useCallback(() => {
    const now = new Date().toISOString();
    updateTodayRecord({ clockIn: now, status: "present" });
    setSession((s) => ({
      ...s,
      clockedIn: true,
      onBreak: false,
      clockInTime: now,
      breakStartTime: null,
    }));
    addActivity({
      type: "attendance",
      message: "Clocked in for the day",
      employeeName: actor()?.name ?? "You",
      employeeId: currentEmployeeId,
      entityType: "attendance",
    });
  }, [addActivity, actor, currentEmployeeId, updateTodayRecord]);

  const clockOut = useCallback(() => {
    const now = new Date().toISOString();
    const today = getTodayISO();
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.employeeId === currentEmployeeId && a.date === today && a.clockIn) {
          const start = new Date(a.clockIn).getTime();
          const end = new Date(now).getTime();
          let breakMs = 0;
          if (a.breakStart && a.breakEnd) {
            breakMs = new Date(a.breakEnd).getTime() - new Date(a.breakStart).getTime();
          }
          const totalHours = Math.round(((end - start - breakMs) / 3600000) * 100) / 100;
          return { ...a, clockOut: now, totalHours, status: "present" as const };
        }
        return a;
      })
    );
    setSession((s) => ({
      ...s,
      clockedIn: false,
      onBreak: false,
      clockInTime: null,
      breakStartTime: null,
    }));
    addActivity({
      type: "attendance",
      message: "Clocked out for the day",
      employeeName: actor()?.name ?? "You",
      employeeId: currentEmployeeId,
      entityType: "attendance",
    });
  }, [addActivity, actor, currentEmployeeId]);

  const breakStart = useCallback(() => {
    const now = new Date().toISOString();
    updateTodayRecord({ breakStart: now, status: "on-break" });
    setSession((s) => ({ ...s, onBreak: true, breakStartTime: now }));
    addActivity({
      type: "attendance",
      message: "Started break",
      employeeName: actor()?.name ?? "You",
      employeeId: currentEmployeeId,
      entityType: "attendance",
    });
  }, [addActivity, actor, currentEmployeeId, updateTodayRecord]);

  const breakEnd = useCallback(() => {
    const now = new Date().toISOString();
    updateTodayRecord({ breakEnd: now, status: "present" });
    setSession((s) => ({ ...s, onBreak: false, breakStartTime: null }));
    addActivity({
      type: "attendance",
      message: "Ended break",
      employeeName: actor()?.name ?? "You",
      employeeId: currentEmployeeId,
      entityType: "attendance",
    });
  }, [addActivity, actor, currentEmployeeId, updateTodayRecord]);

  const exportAttendance = useCallback(() => {
    exportAttendanceCsv(visibleAttendance, getEmployeeById);
  }, [visibleAttendance, getEmployeeById]);

  const stats = useMemo(() => {
    const today = getTodayISO();
    const taskSource = isAdmin ? tasks : visibleTasks;
    const attendanceSource = isAdmin ? attendance : visibleAttendance;

    const activeEmployees = employees.filter((e) => e.status === "active").length;
    const tasksCompletedToday = taskSource.filter(
      (t) => t.status === "done" && t.completedAt?.startsWith(today)
    ).length;
    const todayAttendance = attendanceSource.filter((a) => a.date === today);
    const hoursWorkedToday = todayAttendance.reduce((sum, a) => {
      if (a.clockIn && !a.clockOut) {
        const elapsed = (Date.now() - new Date(a.clockIn).getTime()) / 3600000;
        return sum + elapsed;
      }
      return sum + a.totalHours;
    }, 0);
    const avgPerformance =
      employees.length > 0
        ? employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length
        : 0;
    const completionRate =
      taskSource.length > 0
        ? taskSource.filter((t) => t.status === "done").length / taskSource.length
        : 0;
    const productivityScore = Math.round(avgPerformance * 0.6 + completionRate * 100 * 0.4);

    return {
      totalEmployees: employees.length,
      activeEmployees,
      tasksCompletedToday,
      hoursWorkedToday: Math.round(hoursWorkedToday * 10) / 10,
      productivityScore,
    };
  }, [employees, tasks, visibleTasks, attendance, visibleAttendance, isAdmin]);

  const value = useMemo(
    () => ({
      employees,
      tasks,
      visibleTasks,
      attendance,
      visibleAttendance,
      activity,
      growthInsights,
      analytics: analyticsData,
      session,
      role,
      currentEmployeeId,
      isAdmin,
      isHydrated,
      setRole,
      setCurrentEmployeeId,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      createTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      updateTaskHours,
      addTaskComment,
      setTaskCompletionNote,
      clockIn,
      clockOut,
      breakStart,
      breakEnd,
      exportAttendance,
      getEmployeeById,
      getTaskById,
      getTasksForEmployee,
      getAttendanceForEmployee,
      getGrowthInsight,
      canManageEmployees,
      canCreateTask,
      canEditTask,
      canDeleteTask,
      canUpdateTaskFields,
      stats,
    }),
    [
      employees,
      tasks,
      visibleTasks,
      attendance,
      visibleAttendance,
      activity,
      session,
      role,
      currentEmployeeId,
      isAdmin,
      isHydrated,
      setRole,
      setCurrentEmployeeId,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      createTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      updateTaskHours,
      addTaskComment,
      setTaskCompletionNote,
      clockIn,
      clockOut,
      breakStart,
      breakEnd,
      exportAttendance,
      getEmployeeById,
      getTaskById,
      getTasksForEmployee,
      getAttendanceForEmployee,
      getGrowthInsight,
      canEditTask,
      canDeleteTask,
      canUpdateTaskFields,
      stats,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

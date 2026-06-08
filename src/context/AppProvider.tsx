"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  analyticsData,
  employees as mockEmployees,
  growthInsights,
  initialActivity,
  initialAttendance,
  initialTasks,
} from "@/data/mock";
import { generateId, getTodayISO } from "@/lib/utils";
import type {
  ActivityItem,
  AnalyticsData,
  AttendanceRecord,
  AttendanceSession,
  CreateTaskInput,
  Employee,
  GrowthInsight,
  Task,
  TaskStatus,
} from "@/types";

interface AppContextValue {
  employees: Employee[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  activity: ActivityItem[];
  growthInsights: GrowthInsight[];
  analytics: AnalyticsData;
  session: AttendanceSession;
  currentEmployeeId: string;
  createTask: (input: CreateTaskInput) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskHours: (taskId: string, actualHours: number) => void;
  clockIn: () => void;
  clockOut: () => void;
  breakStart: () => void;
  breakEnd: () => void;
  getEmployeeById: (id: string) => Employee | undefined;
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    tasksCompletedToday: number;
    hoursWorkedToday: number;
    productivityScore: number;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

const CURRENT_EMPLOYEE_ID = "emp-1";

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [session, setSession] = useState<AttendanceSession>(() => {
    const today = getTodayISO();
    const record = initialAttendance.find(
      (a) => a.employeeId === CURRENT_EMPLOYEE_ID && a.date === today
    );
    return {
      clockedIn: !!record?.clockIn && !record?.clockOut,
      onBreak: !!record?.breakStart && !record?.breakEnd,
      clockInTime: record?.clockIn ?? null,
      breakStartTime: record?.breakStart ?? null,
      todayRecordId: record?.id ?? null,
    };
  });

  const addActivity = useCallback((item: Omit<ActivityItem, "id">) => {
    setActivity((prev) => [{ ...item, id: generateId() }, ...prev].slice(0, 20));
  }, []);

  const getEmployeeById = useCallback(
    (id: string) => employees.find((e) => e.id === id),
    [employees]
  );

  const createTask = useCallback(
    (input: CreateTaskInput) => {
      const employee = getEmployeeById(input.assigneeId);
      const newTask: Task = {
        id: generateId(),
        ...input,
        status: "todo",
        actualHours: 0,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      addActivity({
        type: "task",
        message: `Created task: ${input.title}`,
        employeeName: employee?.name ?? "Unknown",
        timestamp: new Date().toISOString(),
      });
    },
    [addActivity, getEmployeeById]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status,
                completedAt: status === "done" ? new Date().toISOString() : t.completedAt,
              }
            : t
        )
      );
      const task = tasks.find((t) => t.id === taskId);
      const employee = task ? getEmployeeById(task.assigneeId) : undefined;
      if (task) {
        addActivity({
          type: "task",
          message: `Updated "${task.title}" to ${status.replace("-", " ")}`,
          employeeName: employee?.name ?? "Unknown",
          timestamp: new Date().toISOString(),
        });
      }
    },
    [addActivity, getEmployeeById, tasks]
  );

  const updateTaskHours = useCallback((taskId: string, actualHours: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, actualHours } : t))
    );
  }, []);

  const updateTodayRecord = useCallback(
    (updates: Partial<AttendanceRecord>) => {
      const today = getTodayISO();
      setAttendance((prev) => {
        const existing = prev.find(
          (a) => a.employeeId === CURRENT_EMPLOYEE_ID && a.date === today
        );
        if (existing) {
          return prev.map((a) =>
            a.id === existing.id ? { ...a, ...updates } : a
          );
        }
        const newRecord: AttendanceRecord = {
          id: generateId(),
          employeeId: CURRENT_EMPLOYEE_ID,
          date: today,
          totalHours: 0,
          status: "present",
          ...updates,
        };
        setSession((s) => ({ ...s, todayRecordId: newRecord.id }));
        return [newRecord, ...prev];
      });
    },
    []
  );

  const clockIn = useCallback(() => {
    const now = new Date().toISOString();
    updateTodayRecord({ clockIn: now, status: "present" });
    setSession({ clockedIn: true, onBreak: false, clockInTime: now, breakStartTime: null, todayRecordId: session.todayRecordId });
    const employee = getEmployeeById(CURRENT_EMPLOYEE_ID);
    addActivity({
      type: "attendance",
      message: "Clocked in for the day",
      employeeName: employee?.name ?? "You",
      timestamp: now,
    });
  }, [addActivity, getEmployeeById, session.todayRecordId, updateTodayRecord]);

  const clockOut = useCallback(() => {
    const now = new Date().toISOString();
    const today = getTodayISO();
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.employeeId === CURRENT_EMPLOYEE_ID && a.date === today && a.clockIn) {
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
    setSession({ clockedIn: false, onBreak: false, clockInTime: null, breakStartTime: null, todayRecordId: session.todayRecordId });
    const employee = getEmployeeById(CURRENT_EMPLOYEE_ID);
    addActivity({
      type: "attendance",
      message: "Clocked out for the day",
      employeeName: employee?.name ?? "You",
      timestamp: now,
    });
  }, [addActivity, getEmployeeById, session.todayRecordId]);

  const breakStart = useCallback(() => {
    const now = new Date().toISOString();
    updateTodayRecord({ breakStart: now, status: "on-break" });
    setSession((s) => ({ ...s, onBreak: true, breakStartTime: now }));
    const employee = getEmployeeById(CURRENT_EMPLOYEE_ID);
    addActivity({
      type: "attendance",
      message: "Started break",
      employeeName: employee?.name ?? "You",
      timestamp: now,
    });
  }, [addActivity, getEmployeeById, updateTodayRecord]);

  const breakEnd = useCallback(() => {
    const now = new Date().toISOString();
    updateTodayRecord({ breakEnd: now, status: "present" });
    setSession((s) => ({ ...s, onBreak: false, breakStartTime: null }));
    const employee = getEmployeeById(CURRENT_EMPLOYEE_ID);
    addActivity({
      type: "attendance",
      message: "Ended break",
      employeeName: employee?.name ?? "You",
      timestamp: now,
    });
  }, [addActivity, getEmployeeById, updateTodayRecord]);

  const stats = useMemo(() => {
    const today = getTodayISO();
    const activeEmployees = employees.filter((e) => e.status === "active").length;
    const tasksCompletedToday = tasks.filter(
      (t) => t.status === "done" && t.completedAt?.startsWith(today)
    ).length;
    const todayAttendance = attendance.filter((a) => a.date === today);
    const hoursWorkedToday = todayAttendance.reduce((sum, a) => {
      if (a.clockIn && !a.clockOut) {
        const elapsed = (Date.now() - new Date(a.clockIn).getTime()) / 3600000;
        return sum + elapsed;
      }
      return sum + a.totalHours;
    }, 0);
    const avgPerformance =
      employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length;
    const completionRate =
      tasks.filter((t) => t.status === "done").length / tasks.length;
    const productivityScore = Math.round(avgPerformance * 0.6 + completionRate * 100 * 0.4);

    return {
      totalEmployees: employees.length,
      activeEmployees,
      tasksCompletedToday,
      hoursWorkedToday: Math.round(hoursWorkedToday * 10) / 10,
      productivityScore,
    };
  }, [employees, tasks, attendance]);

  const value = useMemo(
    () => ({
      employees,
      tasks,
      attendance,
      activity,
      growthInsights,
      analytics: analyticsData,
      session,
      currentEmployeeId: CURRENT_EMPLOYEE_ID,
      createTask,
      updateTaskStatus,
      updateTaskHours,
      clockIn,
      clockOut,
      breakStart,
      breakEnd,
      getEmployeeById,
      stats,
    }),
    [
      employees,
      tasks,
      attendance,
      activity,
      session,
      createTask,
      updateTaskStatus,
      updateTaskHours,
      clockIn,
      clockOut,
      breakStart,
      breakEnd,
      getEmployeeById,
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

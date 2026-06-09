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
import { loadPersistedState, savePersistedState } from "@/lib/storage";
import {
  computeSheetSummary,
  generateEodPlaceholder,
  generateTodPlaceholder,
  getSheetDatesForEmployee,
} from "@/lib/sheets";
import { generateId, getInitials, getTodayISO } from "@/lib/utils";
import type {
  ActivityItem,
  CreateEmployeeInput,
  CreateSheetTaskInput,
  DailySheet,
  Employee,
  SheetSummary,
  SheetTask,
  UpdateEmployeeInput,
  UpdateSheetTaskAdminInput,
  UpdateSheetTaskEmployeeInput,
  UserRole,
  AttendanceRecord,
} from "@/types";

interface AppContextValue {
  employees: Employee[];
  dailySheets: DailySheet[];
  activity: ActivityItem[];
  role: UserRole;
  currentEmployeeId: string;
  isAdmin: boolean;
  isHydrated: boolean;
  today: string;
  setRole: (role: UserRole) => void;
  setCurrentEmployeeId: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getSheet: (employeeId: string, date: string) => DailySheet | undefined;
  getTodaySheet: (employeeId: string) => DailySheet | undefined;
  getSheetSummary: (employeeId: string, date: string) => SheetSummary;
  getSheetHistory: (employeeId: string) => string[];
  ensureSheet: (employeeId: string, date: string) => DailySheet;
  createSheetTask: (employeeId: string, date: string, input: CreateSheetTaskInput) => void;
  updateSheetTaskAdmin: (
    employeeId: string,
    date: string,
    taskId: string,
    input: UpdateSheetTaskAdminInput
  ) => void;
  deleteSheetTask: (employeeId: string, date: string, taskId: string) => void;
  updateSheetTaskEmployee: (
    employeeId: string,
    date: string,
    taskId: string,
    input: UpdateSheetTaskEmployeeInput
  ) => void;
  generateTodDraft: (employeeId: string, date: string) => string;
  generateEodDraft: (employeeId: string, date: string) => string;
  createEmployee: (input: CreateEmployeeInput) => void;
  updateEmployee: (id: string, input: UpdateEmployeeInput) => void;
  deleteEmployee: (id: string) => void;
  canManageEmployees: boolean;
  canManageSheet: (employeeId: string, date: string) => boolean;
  canEditSheetTask: (employeeId: string, date: string) => boolean;
  attendance: AttendanceRecord[];
  getTodayAttendance: (employeeId: string) => AttendanceRecord | undefined;
  getAttendanceByEmployee: (employeeId: string) => AttendanceRecord[];
  clockIn: (employeeId: string) => void;
  startBreak: (employeeId: string) => void;
  endBreak: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
}


const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailySheets, setDailySheets] = useState<DailySheet[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [role, setRoleState] = useState<UserRole>("admin");
  const [currentEmployeeId, setCurrentEmployeeIdState] = useState("emp-1");
  const [isHydrated, setIsHydrated] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const skipSave = useRef(true);
  
  const today = getTodayISO();

  useEffect(() => {
    const stored = loadPersistedState();
    setEmployees(stored.employees);
    setDailySheets(stored.dailySheets);
    setActivity(stored.activity);
    setRoleState(stored.role);
    setCurrentEmployeeIdState(stored.currentEmployeeId);
    setIsHydrated(true);
    setAttendance(stored.attendance ?? []);
  }, []);

  useEffect(() => {
    if (!isHydrated || skipSave.current) {
      skipSave.current = false;
      return;
    }
    savePersistedState({
      version: 3,
      employees,
      dailySheets,
      activity,
      role,
      currentEmployeeId,
      attendance,
    });
  }, [employees, dailySheets, activity, attendance, role, currentEmployeeId, isHydrated]);

  const isAdmin = role === "admin";
  const canManageEmployees = isAdmin;

  const actor = useCallback(
    () => employees.find((e) => e.id === currentEmployeeId),
    [employees, currentEmployeeId]
  );

  const addActivity = useCallback((item: Omit<ActivityItem, "id" | "timestamp">) => {
    setActivity((prev) =>
      [{ ...item, id: generateId(), timestamp: new Date().toISOString() }, ...prev].slice(0, 50)
    );
  }, []);

  const getEmployeeById = useCallback(
    (id: string) => employees.find((e) => e.id === id),
    [employees]
  );

  const getSheet = useCallback(
    (employeeId: string, date: string) =>
      dailySheets.find((s) => s.employeeId === employeeId && s.date === date),
    [dailySheets]
  );

  const getTodaySheet = useCallback(
    (employeeId: string) => getSheet(employeeId, today),
    [getSheet, today]
  );

  const getSheetSummary = useCallback(
    (employeeId: string, date: string) =>
      computeSheetSummary(getSheet(employeeId, date), date),
    [getSheet]
  );

  const getSheetHistory = useCallback(
    (employeeId: string) => getSheetDatesForEmployee(dailySheets, employeeId),
    [dailySheets]
  );

  const canManageSheet = useCallback(
    (employeeId: string, _date: string) => isAdmin,
    [isAdmin]
  );

  const canEditSheetTask = useCallback(
    (employeeId: string, _date: string) =>
      isAdmin || employeeId === currentEmployeeId,
    [isAdmin, currentEmployeeId]
  );

  const updateSheets = useCallback(
    (updater: (sheets: DailySheet[]) => DailySheet[]) => {
      setDailySheets(updater);
    },
    []
  );

  const ensureSheet = useCallback(
    (employeeId: string, date: string): DailySheet => {
      const existing = getSheet(employeeId, date);
      if (existing) return existing;

      const now = new Date().toISOString();
      const newSheet: DailySheet = {
        id: generateId(),
        employeeId,
        date,
        tasks: [],
        todDraft: "",
        eodDraft: "",
        createdAt: now,
        updatedAt: now,
      };
      updateSheets((prev) => [...prev, newSheet]);
      return newSheet;
    },
    [getSheet, updateSheets]
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

  const setCurrentEmployeeId = useCallback((id: string) => {
    setCurrentEmployeeIdState(id);
  }, []);

  const createSheetTask = useCallback(
    (employeeId: string, date: string, input: CreateSheetTaskInput) => {
      if (!isAdmin) return;

      const now = new Date().toISOString();
      updateSheets((prev) => {
        const idx = prev.findIndex((s) => s.employeeId === employeeId && s.date === date);
        const newTask: SheetTask = {
          id: generateId(),
          taskNumber: 0,
          title: input.title,
          description: input.description,
          adminNotes: input.adminNotes,
          referenceImageUrl: input.referenceImageUrl || undefined,
          rarity: input.rarity,
          urgency: input.urgency,
          status: "pending",
          employeeNotes: "",
          completionNote: "",
          assignedAt: now,
          updatedAt: now,
        };

        if (idx >= 0) {
          const sheet = prev[idx];
          newTask.taskNumber = sheet.tasks.length + 1;
          const updated = {
            ...sheet,
            tasks: [...sheet.tasks, newTask],
            updatedAt: now,
          };
          return prev.map((s, i) => (i === idx ? updated : s));
        }

        newTask.taskNumber = 1;
        return [
          ...prev,
          {
            id: generateId(),
            employeeId,
            date,
            tasks: [newTask],
            todDraft: "",
            eodDraft: "",
            createdAt: now,
            updatedAt: now,
          },
        ];
      });

      const emp = getEmployeeById(employeeId);
      addActivity({
        type: "task",
        message: `Assigned "${input.title}" to ${emp?.name ?? "employee"} for ${date}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityType: "task",
      });
    },
    [isAdmin, updateSheets, getEmployeeById, addActivity, actor, currentEmployeeId]
  );

  const updateSheetTaskAdmin = useCallback(
    (
      employeeId: string,
      date: string,
      taskId: string,
      input: UpdateSheetTaskAdminInput
    ) => {
      if (!isAdmin) return;
      const now = new Date().toISOString();

      updateSheets((prev) =>
        prev.map((s) => {
          if (s.employeeId !== employeeId || s.date !== date) return s;
          return {
            ...s,
            updatedAt: now,
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    title: input.title,
                    description: input.description,
                    adminNotes: input.adminNotes,
                    referenceImageUrl: input.referenceImageUrl || undefined,
                    rarity: input.rarity,
                    urgency: input.urgency,
                    updatedAt: now,
                  }
                : t
            ),
          };
        })
      );

      addActivity({
        type: "task",
        message: `Updated task "${input.title}" on ${date}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityType: "task",
      });
    },
    [isAdmin, updateSheets, addActivity, actor, currentEmployeeId]
  );

  const deleteSheetTask = useCallback(
    (employeeId: string, date: string, taskId: string) => {
      if (!isAdmin) return;
      const sheet = getSheet(employeeId, date);
      const task = sheet?.tasks.find((t) => t.id === taskId);
      const now = new Date().toISOString();

      updateSheets((prev) =>
        prev.map((s) => {
          if (s.employeeId !== employeeId || s.date !== date) return s;
          const tasks = s.tasks
            .filter((t) => t.id !== taskId)
            .map((t, i) => ({ ...t, taskNumber: i + 1 }));
          return { ...s, tasks, updatedAt: now };
        })
      );

      if (task) {
        addActivity({
          type: "task",
          message: `Deleted task "${task.title}" from ${date}`,
          employeeName: actor()?.name ?? "Admin",
          employeeId: currentEmployeeId,
          entityType: "task",
        });
      }
    },
    [isAdmin, getSheet, updateSheets, addActivity, actor, currentEmployeeId]
  );

  const updateSheetTaskEmployee = useCallback(
    (
      employeeId: string,
      date: string,
      taskId: string,
      input: UpdateSheetTaskEmployeeInput
    ) => {
      if (!isAdmin && employeeId !== currentEmployeeId) return;
      const now = new Date().toISOString();

      updateSheets((prev) =>
        prev.map((s) => {
          if (s.employeeId !== employeeId || s.date !== date) return s;
          return {
            ...s,
            updatedAt: now,
            tasks: s.tasks.map((t) => {
              if (t.id !== taskId) return t;
              const status = input.status ?? t.status;
              return {
                ...t,
                status,
                employeeNotes: input.employeeNotes ?? t.employeeNotes,
                completionNote: input.completionNote ?? t.completionNote,
                completedAt:
                  status === "completed" && t.status !== "completed"
                    ? now
                    : status !== "completed"
                      ? undefined
                      : t.completedAt,
                updatedAt: now,
              };
            }),
          };
        })
      );

      const sheet = getSheet(employeeId, date);
      const task = sheet?.tasks.find((t) => t.id === taskId);
      if (task && input.status) {
        addActivity({
          type: "sheet",
          message: `Updated #${task.taskNumber} "${task.title}" to ${input.status.replace("_", " ")}`,
          employeeName: actor()?.name ?? "Employee",
          employeeId: currentEmployeeId,
          entityType: "sheet",
        });
      }
    },
    [isAdmin, currentEmployeeId, updateSheets, getSheet, addActivity, actor]
  );

  const generateTodDraft = useCallback(
    (employeeId: string, date: string) => {
      const sheet = ensureSheet(employeeId, date);
      const employee = getEmployeeById(employeeId);
      if (!employee) return "";
      const draft = generateTodPlaceholder(sheet, employee);
      const now = new Date().toISOString();
      updateSheets((prev) =>
        prev.map((s) =>
          s.employeeId === employeeId && s.date === date
            ? { ...s, todDraft: draft, updatedAt: now }
            : s
        )
      );
      return draft;
    },
    [ensureSheet, getEmployeeById, updateSheets]
  );

  const generateEodDraft = useCallback(
    (employeeId: string, date: string) => {
      const sheet = ensureSheet(employeeId, date);
      const employee = getEmployeeById(employeeId);
      if (!employee) return "";
      const draft = generateEodPlaceholder(sheet, employee);
      const now = new Date().toISOString();
      updateSheets((prev) =>
        prev.map((s) =>
          s.employeeId === employeeId && s.date === date
            ? { ...s, eodDraft: draft, updatedAt: now }
            : s
        )
      );
      return draft;
    },
    [ensureSheet, getEmployeeById, updateSheets]
  );

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
          e.id === id ? { ...e, ...input, avatar: getInitials(input.name) } : e
        )
      );
      addActivity({
        type: "employee",
        message: `Updated employee: ${input.name}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
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
      setDailySheets((prev) => prev.filter((s) => s.employeeId !== id));

      addActivity({
        type: "employee",
        message: `Removed employee: ${employee.name}`,
        employeeName: actor()?.name ?? "Admin",
        employeeId: currentEmployeeId,
        entityType: "employee",
      });
    },
    [isAdmin, getEmployeeById, currentEmployeeId, addActivity, actor]
  );
  const getTodayAttendance = useCallback(
    (employeeId: string) =>
      attendance.find((item) => item.employeeId === employeeId && item.date === today),
    [attendance, today]
  );

  const getAttendanceByEmployee = useCallback(
    (employeeId: string) =>
      attendance
        .filter((item) => item.employeeId === employeeId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [attendance]
  );

  const getBreakMinutes = useCallback((breaks: AttendanceRecord["breaks"]) => {
    return breaks.reduce((total, breakItem) => {
      if (!breakItem.endTime) return total;

      return (
        total +
        Math.floor(
          (new Date(breakItem.endTime).getTime() -
            new Date(breakItem.startTime).getTime()) /
            60000
        )
      );
    }, 0);
  }, []);

  const calculateFinalAttendanceStatus = useCallback(
    (clockIn: string, workedMinutes: number, requiredMinutes: number) => {
      const clockInDate = new Date(clockIn);
      const shiftStartDate = new Date(clockInDate);
      shiftStartDate.setHours(9, 0, 0, 0);

      if (workedMinutes >= requiredMinutes) {
        return clockInDate > shiftStartDate ? "late" : "present";
      }

      if (workedMinutes >= requiredMinutes / 2) return "half_day";

      return "absent";
    },
    []
  );

  const clockIn = useCallback(
    (employeeId: string) => {
      const now = new Date().toISOString();

      setAttendance((prev) => {
        const existing = prev.find(
          (item) => item.employeeId === employeeId && item.date === today
        );

        if (existing?.clockIn) return prev;

        return [
          ...prev,
          {
            id: generateId(),
            employeeId,
            date: today,
            shiftStart: "09:00",
            shiftEnd: "18:00",
            requiredMinutes: 480,
            clockIn: now,
            breaks: [],
            breakMinutes: 0,
            workedMinutes: 0,
            status: "working",
            createdAt: now,
            updatedAt: now,
          },
        ];
      });
    },
    [today]
  );

  const startBreak = useCallback(
    (employeeId: string) => {
      const now = new Date().toISOString();

      setAttendance((prev) =>
        prev.map((item) => {
          if (
            item.employeeId !== employeeId ||
            item.date !== today ||
            !item.clockIn ||
            item.clockOut
          ) {
            return item;
          }

          const hasOpenBreak = item.breaks.some((breakItem) => !breakItem.endTime);
          if (hasOpenBreak) return item;

          return {
            ...item,
            status: "on_break",
            breaks: [...item.breaks, { id: generateId(), startTime: now }],
            updatedAt: now,
          };
        })
      );
    },
    [today]
  );

  const endBreak = useCallback(
    (employeeId: string) => {
      const now = new Date().toISOString();

      setAttendance((prev) =>
        prev.map((item) => {
          if (item.employeeId !== employeeId || item.date !== today) return item;

          const breaks = item.breaks.map((breakItem) =>
            !breakItem.endTime ? { ...breakItem, endTime: now } : breakItem
          );

          return {
            ...item,
            breaks,
            breakMinutes: getBreakMinutes(breaks),
            status: "working",
            updatedAt: now,
          };
        })
      );
    },
    [today, getBreakMinutes]
  );

  const clockOut = useCallback(
    (employeeId: string) => {
      const now = new Date().toISOString();

      setAttendance((prev) =>
        prev.map((item) => {
          if (
            item.employeeId !== employeeId ||
            item.date !== today ||
            !item.clockIn ||
            item.clockOut
          ) {
            return item;
          }

          const breaks = item.breaks.map((breakItem) =>
            !breakItem.endTime ? { ...breakItem, endTime: now } : breakItem
          );

          const breakMinutes = getBreakMinutes(breaks);

          const totalMinutes = Math.floor(
            (new Date(now).getTime() - new Date(item.clockIn).getTime()) / 60000
          );

          const workedMinutes = Math.max(totalMinutes - breakMinutes, 0);

          return {
            ...item,
            clockOut: now,
            breaks,
            breakMinutes,
            workedMinutes,
            status: calculateFinalAttendanceStatus(
              item.clockIn,
              workedMinutes,
              item.requiredMinutes
            ),
            updatedAt: now,
          };
        })
      );
    },
    [today, getBreakMinutes, calculateFinalAttendanceStatus]
  );
  const value = useMemo(
    () => ({
      employees,
      dailySheets,
      activity,
      role,
      currentEmployeeId,
      isAdmin,
      isHydrated,
      today,
      setRole,
      setCurrentEmployeeId,
      getEmployeeById,
      getSheet,
      getTodaySheet,
      getSheetSummary,
      getSheetHistory,
      ensureSheet,
      createSheetTask,
      updateSheetTaskAdmin,
      deleteSheetTask,
      updateSheetTaskEmployee,
      generateTodDraft,
      generateEodDraft,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      canManageEmployees,
      canManageSheet,
      canEditSheetTask,
            attendance,
      getTodayAttendance,
      getAttendanceByEmployee,
      clockIn,
      startBreak,
      endBreak,
      clockOut,
    }),
    [
      employees,
      dailySheets,
      activity,
      role,
      currentEmployeeId,
      isAdmin,
      isHydrated,
      today,
      setRole,
      setCurrentEmployeeId,
      getEmployeeById,
      getSheet,
      getTodaySheet,
      getSheetSummary,
      getSheetHistory,
      ensureSheet,
      createSheetTask,
      updateSheetTaskAdmin,
      deleteSheetTask,
      updateSheetTaskEmployee,
      generateTodDraft,
      generateEodDraft,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      canManageSheet,
      canEditSheetTask,
            attendance,
      getTodayAttendance,
      getAttendanceByEmployee,
      clockIn,
      startBreak,
      endBreak,
      clockOut,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

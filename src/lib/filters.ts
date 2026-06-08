import type { Employee, EmployeeStatus, Task, TaskPriority, TaskStatus } from "@/types";

export type EmployeeSort = "name" | "performance" | "department" | "joined";

export interface EmployeeFilters {
  search: string;
  department: string;
  status: EmployeeStatus | "all";
  minPerformance: number;
  sort: EmployeeSort;
}

export interface TaskFilters {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assigneeId: string;
}

export function filterEmployees(
  employees: Employee[],
  filters: EmployeeFilters
): Employee[] {
  const search = filters.search.toLowerCase().trim();

  let result = employees.filter((e) => {
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search) ||
      e.role.toLowerCase().includes(search) ||
      e.email.toLowerCase().includes(search) ||
      e.department.toLowerCase().includes(search);
    const matchesDept =
      filters.department === "all" || e.department === filters.department;
    const matchesStatus =
      filters.status === "all" || e.status === filters.status;
    const matchesPerformance = e.performanceScore >= filters.minPerformance;
    return matchesSearch && matchesDept && matchesStatus && matchesPerformance;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "performance":
        return b.performanceScore - a.performanceScore;
      case "department":
        return a.department.localeCompare(b.department) || a.name.localeCompare(b.name);
      case "joined":
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return result;
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const search = filters.search.toLowerCase().trim();

  return tasks.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search);
    const matchesStatus = filters.status === "all" || t.status === filters.status;
    const matchesPriority =
      filters.priority === "all" || t.priority === filters.priority;
    const matchesAssignee =
      filters.assigneeId === "all" || t.assigneeId === filters.assigneeId;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });
}

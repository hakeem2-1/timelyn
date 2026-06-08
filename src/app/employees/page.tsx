"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { AppShell } from "@/components/layout/AppShell";
import type { EmployeeStatus } from "@/types";

function EmployeesContent() {
  const { employees } = useApp();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState<EmployeeStatus | "all">("all");

  const departments = useMemo(
    () => ["all", ...new Set(employees.map((e) => e.department))],
    [employees]
  );

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase());
    const matchesDept = department === "all" || e.department === department;
    const matchesStatus = status === "all" || e.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          {filtered.length} of {employees.length} employees
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none sm:w-52"
            />
          </div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === "all" ? "All Departments" : d}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EmployeeStatus | "all")}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <AppShell title="Employees" subtitle="Manage your team members">
      <EmployeesContent />
    </AppShell>
  );
}

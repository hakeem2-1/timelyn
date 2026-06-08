"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { filterEmployees, type EmployeeSort } from "@/lib/filters";
import type { EmployeeStatus } from "@/types";

function EmployeesContent() {
  const { employees, canManageEmployees } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState<EmployeeStatus | "all">("all");
  const [minPerformance, setMinPerformance] = useState(0);
  const [sort, setSort] = useState<EmployeeSort>("name");
  const [showFilters, setShowFilters] = useState(false);

  const departments = useMemo(
    () => ["all", ...new Set(employees.map((e) => e.department))],
    [employees]
  );

  const filtered = useMemo(
    () =>
      filterEmployees(employees, {
        search,
        department,
        status,
        minPerformance,
        sort,
      }),
    [employees, search, department, status, minPerformance, sort]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            {filtered.length} of {employees.length} employees
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 sm:min-w-64">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              <input
                type="text"
                placeholder="Search name, role, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            {canManageEmployees && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
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
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as EmployeeSort)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300 focus:outline-none"
            >
              <option value="name">Sort: Name</option>
              <option value="performance">Sort: Performance</option>
              <option value="department">Sort: Department</option>
              <option value="joined">Sort: Newest</option>
            </select>
            <select
              value={minPerformance}
              onChange={(e) => setMinPerformance(Number(e.target.value))}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300 focus:outline-none"
            >
              <option value={0}>Min performance: Any</option>
              <option value={80}>Min performance: 80%+</option>
              <option value={85}>Min performance: 85%+</option>
              <option value={90}>Min performance: 90%+</option>
            </select>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No employees match your filters"
          description="Try adjusting search or filter criteria."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Employee">
        <EmployeeForm
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
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

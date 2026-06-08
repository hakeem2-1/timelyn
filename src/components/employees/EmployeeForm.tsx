"use client";

import { useState } from "react";
import type { CreateEmployeeInput, Employee, EmployeeStatus } from "@/types";
import { useApp } from "@/context/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Analytics",
  "People",
  "Support",
];

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const { createEmployee, updateEmployee } = useApp();
  const isEdit = !!employee;

  const [form, setForm] = useState<CreateEmployeeInput>({
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    role: employee?.role ?? "",
    department: employee?.department ?? DEPARTMENTS[0],
    status: employee?.status ?? "active",
    performanceScore: employee?.performanceScore ?? 80,
    joinedAt: employee?.joinedAt ?? new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    if (isEdit && employee) {
      updateEmployee(employee.id, form);
    } else {
      createEmployee(form);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Jane Doe"
        required
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="jane@timelyn.io"
        required
      />
      <Input
        label="Job Title"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        placeholder="Software Engineer"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as EmployeeStatus })
          }
          options={[
            { value: "active", label: "Active" },
            { value: "away", label: "Away" },
            { value: "offline", label: "Offline" },
            { value: "on-leave", label: "On Leave" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Performance Score"
          type="number"
          min={0}
          max={100}
          value={form.performanceScore}
          onChange={(e) =>
            setForm({ ...form, performanceScore: Number(e.target.value) || 0 })
          }
        />
        <Input
          label="Joined Date"
          type="date"
          value={form.joinedAt}
          onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? "Save Changes" : "Add Employee"}</Button>
      </div>
    </form>
  );
}

"use client";

import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { InsightCard } from "@/components/growth/InsightCard";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";

const statusVariant = {
  active: "success",
  away: "warning",
  offline: "default",
  "on-leave": "info",
} as const;

const statusLabel = {
  active: "Active",
  away: "Away",
  offline: "Offline",
  "on-leave": "On Leave",
} as const;

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getEmployeeById,
    getTasksForEmployee,
    getAttendanceForEmployee,
    getGrowthInsight,
    deleteEmployee,
    canManageEmployees,
  } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const employee = getEmployeeById(id);
  const tasks = getTasksForEmployee(id);
  const attendance = getAttendanceForEmployee(id);
  const insight = getGrowthInsight(id);

  if (!employee) {
    return (
      <AppShell title="Employee Not Found" subtitle="">
        <div className="py-12 text-center">
          <p className="text-zinc-500">This employee does not exist.</p>
          <Link href="/employees" className="mt-4 inline-block text-sm text-violet-400 hover:underline">
            ← Back to employees
          </Link>
        </div>
      </AppShell>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const totalHours = attendance.reduce((sum, a) => sum + a.totalHours, 0);

  const handleDelete = () => {
    deleteEmployee(id);
    router.push("/employees");
  };

  return (
    <AppShell title={employee.name} subtitle={employee.role}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to employees
          </Link>
          {canManageEmployees && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar initials={employee.avatar} size="lg" />
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-100">{employee.name}</h2>
                    <p className="text-sm text-zinc-500">{employee.role}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant[employee.status]}>
                        {statusLabel[employee.status]}
                      </Badge>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        {employee.department}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold text-violet-400">
                    {employee.performanceScore}%
                  </p>
                  <p className="text-xs text-zinc-500">Performance score</p>
                </div>
              </div>

              <ProgressBar
                value={employee.performanceScore}
                color={employee.performanceScore >= 90 ? "emerald" : "violet"}
                showLabel
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <CheckSquare className="h-4 w-4" />
                    <span className="text-xs">Tasks</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-zinc-200">
                    {completedTasks}/{tasks.length}
                  </p>
                  <p className="text-xs text-zinc-600">completed</p>
                </div>
                <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Hours logged</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-zinc-200">{totalHours}h</p>
                  <p className="text-xs text-zinc-600">total attendance</p>
                </div>
                <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Joined</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-zinc-200">
                    {formatDate(employee.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-zinc-800/60 pt-4 text-sm text-zinc-500">
                <Mail className="h-4 w-4" />
                {employee.email}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-zinc-100">Assigned Tasks</h3>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {tasks.length === 0 ? (
                <p className="px-5 py-4 text-sm text-zinc-500">No tasks assigned.</p>
              ) : (
                tasks.slice(0, 6).map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between border-b border-zinc-800/40 px-5 py-3 transition-colors last:border-0 hover:bg-zinc-800/20"
                  >
                    <span className="truncate text-sm text-zinc-300">{task.title}</span>
                    <Badge
                      variant={
                        task.status === "done"
                          ? "success"
                          : task.status === "in-progress"
                            ? "info"
                            : "default"
                      }
                    >
                      {task.status}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {insight && <InsightCard employee={employee} insight={insight} />}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Employee">
        <EmployeeForm
          employee={employee}
          onSuccess={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        description={`Delete ${employee.name}? Their assigned tasks and attendance records will also be removed.`}
        confirmLabel="Delete Employee"
      />
    </AppShell>
  );
}

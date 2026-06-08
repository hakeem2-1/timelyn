import type { AttendanceRecord, Employee } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportAttendanceCsv(
  records: AttendanceRecord[],
  getEmployee: (id: string) => Employee | undefined
): void {
  const headers = [
    "Employee",
    "Email",
    "Department",
    "Date",
    "Clock In",
    "Clock Out",
    "Break Start",
    "Break End",
    "Total Hours",
    "Status",
  ];

  const rows = records.map((record) => {
    const employee = getEmployee(record.employeeId);
    return [
      employee?.name ?? "Unknown",
      employee?.email ?? "",
      employee?.department ?? "",
      formatDate(record.date),
      record.clockIn ? formatTime(record.clockIn) : "",
      record.clockOut ? formatTime(record.clockOut) : "",
      record.breakStart ? formatTime(record.breakStart) : "",
      record.breakEnd ? formatTime(record.breakEnd) : "",
      record.totalHours > 0 ? String(record.totalHours) : "",
      record.status,
    ].map(escapeCsvField);
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `timelyn-timesheet-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

"use client";

import { useMemo } from "react";
import { downloadCsv } from "@/lib/csv";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  attendanceRecords,
  reportTypes,
  type AttendanceRecord,
} from "../_data";

const PAGE_SIZE = 10;
const FILTERS = {
  reportType: "All Records (Standard)",
  period: "All",
  dateRange: "Last 7 Days",
  department: "All Departments",
  location: "All Locations",
  status: "All Statuses",
  q: "",
  gps: "all",
  page: 1,
};

const statusLabel: Record<AttendanceRecord["status"], string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  "checked-out": "Checked Out",
  incomplete: "Incomplete",
};

function isException(record: AttendanceRecord) {
  return (
    record.status === "late" ||
    record.status === "absent" ||
    record.status === "incomplete" ||
    record.gps === "outside"
  );
}

export function useAttendanceReports() {
  const { filters, setFilters, resetFilters } = useQueryFilters(FILTERS);

  const filtered = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return attendanceRecords.filter((record) => {
      const matchesQuery =
        needle.length === 0 ||
        record.name.toLowerCase().includes(needle) ||
        record.staffId.toLowerCase().includes(needle);
      const matchesDepartment =
        filters.department === "All Departments" || record.department === filters.department;
      const matchesLocation =
        filters.location === "All Locations" || record.location === filters.location;
      const matchesStatus =
        filters.status === "All Statuses" || statusLabel[record.status] === filters.status;
      const matchesGps = filters.gps === "all" || record.gps === filters.gps;
      const matchesPeriod =
        filters.period === "All" ||
        filters.period === "Weekly" ||
        filters.period === "Monthly" ||
        (filters.period === "Daily" && record.date === "Oct 24, 2023") ||
        (filters.period === "Exceptions" && isException(record));
      const matchesReport =
        filters.reportType !== "Exception Report" || isException(record);
      const matchesDate =
        filters.dateRange !== "Today" || record.date === "Oct 24, 2023";

      return (
        matchesQuery &&
        matchesDepartment &&
        matchesLocation &&
        matchesStatus &&
        matchesGps &&
        matchesPeriod &&
        matchesReport &&
        matchesDate
      );
    });
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(filters.page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function exportData() {
    const header =
      "Name,Staff ID,Department,Location,Date,Check In,Check Out,Status,GPS";
    const rows = filtered.map(
      (record) =>
        `"${record.name}","${record.staffId}","${record.department}","${record.location}","${record.date}","${record.checkIn ?? ""}","${record.checkOut ?? ""}","${statusLabel[record.status]}","${record.gps}"`,
    );
    downloadCsv("attendance-report.csv", [header, ...rows].join("\n"));
  }

  return {
    reportType: filters.reportType as (typeof reportTypes)[number],
    period: filters.period,
    dateRange: filters.dateRange,
    department: filters.department,
    location: filters.location,
    status: filters.status,
    query: filters.q,
    gpsFilter: filters.gps as "all" | "match" | "outside",
    filtered,
    visible,
    currentPage,
    pageCount,
    showingFrom: filtered.length === 0 ? 0 : start + 1,
    showingTo: Math.min(start + PAGE_SIZE, filtered.length),
    setReportType: (reportType: string) => setFilters({ reportType }),
    setPeriod: (period: string) => setFilters({ period }),
    setDateRange: (dateRange: string) => setFilters({ dateRange }),
    setDepartment: (department: string) => setFilters({ department }),
    setLocation: (location: string) => setFilters({ location }),
    setStatus: (status: string) => setFilters({ status }),
    setQuery: (q: string) => setFilters({ q }),
    setGpsFilter: (gps: string) => setFilters({ gps }),
    setPage: (page: number | ((current: number) => number)) =>
      setFilters({ page: typeof page === "function" ? page(filters.page) : page }),
    resetFilters,
    exportData,
  };
}

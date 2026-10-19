"use client";

import { useEffect, useState } from "react";
import { useSnackbar } from "@/components/snackbar";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { rememberAttendance } from "@/lib/admin/attendance-cache";
import { api } from "@/lib/api";
import { formatDayLabel, timeFromIso } from "@/lib/format";
import { adminFailureNotice } from "@/lib/messages";
import { pageItems } from "@/lib/pagination";
import type { AttendanceRecord, AttendanceStatus } from "../_data";

const PAGE_SIZE = 20;

const FILTERS = {
  period: "All",
  dateRange: "Last 7 Days",
  q: "",
  page: 1,
};

export type LiveAttendanceRecord = AttendanceRecord & {
  serverStatus: string;
  statusLabel: string;
};

export type AttendanceFilterChip = {
  id: string;
  label: string;
  onClear: () => void;
};

function lagosToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftIso(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function datesFor(period: string, dateRange: string): { startDate?: string; endDate?: string } {
  const today = lagosToday();
  if (period === "Daily" || dateRange === "Today") {
    return { startDate: today, endDate: today };
  }
  if (period === "Weekly" || (period === "All" && dateRange === "Last 7 Days")) {
    return { startDate: shiftIso(today, -6), endDate: today };
  }
  if (period === "Monthly" || dateRange === "This Month") {
    return { startDate: `${today.slice(0, 7)}-01`, endDate: today };
  }
  if (dateRange === "Last 30 Days") {
    return { startDate: shiftIso(today, -29), endDate: today };
  }
  return { startDate: shiftIso(today, -6), endDate: today };
}

function uiStatus(serverStatus: string): AttendanceStatus {
  if (serverStatus === "signed_out") return "checked-out";
  if (serverStatus === "signed_in") return "present";
  return "incomplete";
}

function statusText(serverStatus: string) {
  if (serverStatus === "signed_in") return "Signed in";
  if (serverStatus === "signed_out") return "Signed out";
  return serverStatus.replaceAll("_", " ");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function useAttendanceReports() {
  const snackbar = useSnackbar();
  const { filters, setFilters, resetFilters } = useQueryFilters(FILTERS);
  const [rows, setRows] = useState<LiveAttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);

  const range = datesFor(filters.period, filters.dateRange);
  const staffId = filters.q.trim();
  const requestKey = `${filters.page}|${filters.period}|${filters.dateRange}|${staffId}`;
  const [loadedKey, setLoadedKey] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    api.admin
      .listAttendance({
        page: filters.page,
        pageSize: PAGE_SIZE,
        startDate: range.startDate,
        endDate: range.endDate,
        staffId,
      })
      .then((result) => {
        if (!active) return;
        if (result.kind !== "success") {
          setRows([]);
          setTotal(0);
          const notice = adminFailureNotice(result);
          setLoadError(notice.title);
          snackbar({ tone: "error", title: notice.title, description: notice.description });
          setLoadedKey(requestKey);
          return;
        }
        setLoadError(null);
        rememberAttendance(result.page.results);
        setTotal(result.page.count);
        setRows(
          result.page.results.map((row) => ({
            id: row.id,
            name: row.staffName || row.staffId,
            staffId: row.staffId,
            initials: initials(row.staffName || row.staffId),
            avatar: "green",
            department: row.officeName || "—",
            location: row.location || "—",
            date: row.date ? formatDayLabel(row.date) : "—",
            checkIn: row.signInAt ? timeFromIso(row.signInAt) : null,
            checkOut: row.signOutAt ? timeFromIso(row.signOutAt) : null,
            status: uiStatus(row.status),
            serverStatus: row.status,
            statusLabel: statusText(row.status),
            gps: "none",
          })),
        );
        setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [filters.page, filters.period, filters.dateRange, range.endDate, range.startDate, requestKey, snackbar, staffId]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(filters.page, pageCount);
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, total);
  const needle = filters.q.trim();
  const chips: AttendanceFilterChip[] = [
    needle
      ? { id: "q", label: `“${needle}”`, onClear: () => setFilters({ q: "", page: 1 }) }
      : null,
    filters.period !== "All"
      ? { id: "period", label: filters.period, onClear: () => setFilters({ period: "All", page: 1 }) }
      : null,
    filters.dateRange !== "Last 7 Days"
      ? {
          id: "date",
          label: filters.dateRange,
          onClear: () => setFilters({ dateRange: "Last 7 Days", page: 1 }),
        }
      : null,
  ].filter((chip): chip is AttendanceFilterChip => chip !== null);

  async function exportData(format: "csv" | "xlsx") {
    const result = await api.admin.exportAttendance({
      format,
      startDate: range.startDate,
      endDate: range.endDate,
      staffId,
    });
    if (result.kind !== "success") {
      const notice = adminFailureNotice(result);
      snackbar({ tone: "error", title: notice.title, description: notice.description });
      return;
    }
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
    snackbar({
      tone: "success",
      title: format === "csv" ? "CSV downloaded." : "Excel file downloaded.",
    });
  }

  return {
    period: filters.period,
    dateRange: filters.dateRange,
    query: filters.q,
    loading,
    loadError,
    visible: rows,
    total,
    currentPage,
    pageCount,
    showingFrom,
    showingTo,
    chips,
    pageItems: pageItems(currentPage, pageCount),
    setPeriod: (period: string) => setFilters({ period, page: 1 }),
    setDateRange: (dateRange: string) => setFilters({ dateRange, page: 1 }),
    setQuery: (q: string) => setFilters({ q, page: 1 }),
    setPage: (page: number | ((current: number) => number)) =>
      setFilters({ page: typeof page === "function" ? page(filters.page) : page }),
    resetFilters,
    exportData,
  };
}

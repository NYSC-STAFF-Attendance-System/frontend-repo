"use client";

import { useMemo } from "react";
import { downloadCsv } from "@/lib/csv";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { paginate } from "@/lib/pagination";
import {
  auditEvents,
  getAuditEventDetail,
} from "../_data";

const PAGE_SIZE = 7;
const FILTERS = {
  q: "",
  date: "Today",
  module: "All Modules",
  action: "All Actions",
  role: "All Roles",
  page: 1,
  event: "",
};

export function useAuditLog() {
  const { filters, setFilters, resetFilters } = useQueryFilters(FILTERS);

  const filtered = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return auditEvents.filter((event) => {
      const matchesQuery =
        needle.length === 0 ||
        event.user.toLowerCase().includes(needle) ||
        event.userId.toLowerCase().includes(needle) ||
        event.recordCode.toLowerCase().includes(needle) ||
        event.recordDetail.toLowerCase().includes(needle);
      const matchesDate = filters.date === "Today" ? event.date === "Oct 24, 2023" : true;
      const matchesModule = filters.module === "All Modules" || event.module === filters.module;
      const matchesAction = filters.action === "All Actions" || event.action === filters.action;
      const matchesRole = filters.role === "All Roles" || event.role === filters.role;
      return matchesQuery && matchesDate && matchesModule && matchesAction && matchesRole;
    });
  }, [filters]);

  const attendanceCount = filtered.filter((event) => event.module === "Attendance").length;
  const adminCount = filtered.filter(
    (event) => event.role === "Administrator" || event.module === "Settings",
  ).length;
  const attendanceShare =
    filtered.length === 0 ? 0 : Math.round((attendanceCount / filtered.length) * 1000) / 10;

  const page = paginate(filtered, filters.page, PAGE_SIZE);
  const selected =
    (filters.event
      ? filtered.find((event) => event.id === filters.event) ??
        auditEvents.find((event) => event.id === filters.event)
      : undefined) ?? undefined;
  const selectedDetail = selected ? getAuditEventDetail(selected) : null;
  const chips = [
    filters.q.trim() ? { key: "search", label: `Search: "${filters.q.trim()}"` } : null,
    filters.date !== "Today" ? { key: "date", label: `Date: ${filters.date}` } : null,
    filters.module !== "All Modules" ? { key: "module", label: filters.module } : null,
    filters.action !== "All Actions" ? { key: "action", label: filters.action } : null,
    filters.role !== "All Roles" ? { key: "role", label: filters.role } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  function exportCsv() {
    const header = "Date,Time,User,User ID,Role,Action,Module,Record,Detail";
    const rows = filtered.map((event) =>
      [
        event.date,
        event.time,
        event.user,
        event.userId,
        event.role,
        event.action,
        event.module,
        event.recordCode,
        event.recordDetail,
      ]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(","),
    );
    downloadCsv("audit-log.csv", [header, ...rows].join("\n"));
  }

  return {
    query: filters.q,
    date: filters.date,
    module: filters.module,
    action: filters.action,
    role: filters.role,
    filtered,
    attendanceCount,
    adminCount,
    attendanceShare,
    visible: page.rows,
    currentPage: page.currentPage,
    pageCount: page.pageCount,
    showingFrom: page.from,
    showingTo: page.to,
    selectedId: filters.event || null,
    selectedDetail,
    chips,
    setQuery: (q: string) => setFilters({ q }),
    setDate: (date: string) => setFilters({ date }),
    setModule: (module: string) => setFilters({ module }),
    setAction: (action: string) => setFilters({ action }),
    setRole: (role: string) => setFilters({ role }),
    setPage: (page: number | ((current: number) => number)) =>
      setFilters({ page: typeof page === "function" ? page(filters.page) : page }),
    setSelectedId: (event: string | null) => setFilters({ event: event ?? "" }),
    resetFilters,
    exportCsv,
  };
}

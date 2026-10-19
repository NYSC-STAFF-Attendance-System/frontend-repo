"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { formatDayLabel, timeFromIso } from "@/lib/format";
import { adminFailureNotice } from "@/lib/messages";
import { DEFAULT_PAGE_SIZE, pageItems, paginate } from "@/lib/pagination";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useSnackbar } from "@/components/snackbar";

const FILTERS = {
  q: "",
  department: "all",
  office: "all",
  page: 1,
};

export type StaffRow = {
  id: string;
  name: string;
  staffId: string;
  initials: string;
  department: string;
  office: string;
  registeredOn: string;
  registeredAt: string;
  status: string;
};

function labelStatus(status: string) {
  return status.replaceAll("_", " ");
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function useStaffApprovals() {
  const snackbar = useSnackbar();
  const { filters, setFilters, resetFilters } = useQueryFilters(FILTERS);
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setRevision((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    api.admin.listStaff().then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.kind !== "success") {
        const notice = adminFailureNotice(result);
        setLoadError(notice.title);
        snackbar({ tone: "error", title: notice.title, description: notice.description });
        return;
      }
      setLoadError(null);
      setRows(
        result.staff.map((staff) => ({
          id: staff.id || staff.staffId,
          name: staff.fullName || staff.staffId,
          staffId: staff.staffId,
          initials: initialsFor(staff.fullName || staff.staffId),
          department: staff.department?.replaceAll("_", " ") || "—",
          office: staff.officeName || "—",
          registeredOn: staff.registeredAt ? formatDayLabel(staff.registeredAt.slice(0, 10)) : "—",
          registeredAt: staff.registeredAt ? timeFromIso(staff.registeredAt) : "",
          status: labelStatus(staff.status || "unknown"),
        })),
      );
    });
    return () => {
      active = false;
    };
  }, [revision, snackbar]);

  const departments = useMemo(
    () => [...new Set(rows.map((row) => row.department))].filter((value) => value !== "—").sort(),
    [rows],
  );
  const offices = useMemo(
    () => [...new Set(rows.map((row) => row.office))].filter((value) => value !== "—").sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return rows.filter((staff) => {
      const matchesQuery =
        needle.length === 0 ||
        staff.name.toLowerCase().includes(needle) ||
        staff.staffId.toLowerCase().includes(needle);
      const matchesDepartment = filters.department === "all" || staff.department === filters.department;
      const matchesOffice = filters.office === "all" || staff.office === filters.office;
      return matchesQuery && matchesDepartment && matchesOffice;
    });
  }, [filters.department, filters.office, filters.q, rows]);

  const page = paginate(filtered, filters.page, DEFAULT_PAGE_SIZE);
  const pendingCount = rows.filter((row) => row.status.toLowerCase().includes("pending")).length;
  const activeCount = rows.filter((row) => row.status.toLowerCase() === "active").length;

  const exportList = useCallback(() => {
    const header = "Name,Staff ID,Department,Office,Status,Registered";
    const body = filtered.map((staff) =>
      [staff.name, staff.staffId, staff.department, staff.office, staff.status, staff.registeredOn]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(","),
    );
    downloadCsv("staff.csv", [header, ...body].join("\n"));
    snackbar({ tone: "success", title: "Staff list downloaded." });
  }, [filtered, snackbar]);

  return {
    loading,
    loadError,
    reload,
    pendingCount,
    activeCount,
    queue: rows,
    departments,
    offices,
    query: filters.q,
    department: filters.department,
    office: filters.office,
    setQuery: (q: string) => setFilters({ q }),
    setDepartment: (department: string) => setFilters({ department }),
    setOffice: (office: string) => setFilters({ office }),
    setPage: (pageNumber: number | ((current: number) => number)) =>
      setFilters({
        page: typeof pageNumber === "function" ? pageNumber(filters.page) : pageNumber,
      }),
    resetFilters,
    filtered,
    visible: page.rows,
    currentPage: page.currentPage,
    pageCount: page.pageCount,
    pageItems: pageItems(page.currentPage, page.pageCount),
    showingFrom: page.from,
    showingTo: page.to,
    exportList,
  };
}

import { useCallback, useMemo } from "react";
import { type ApprovalRequest } from "../_data";
import { DEFAULT_PAGE_SIZE, paginate } from "@/lib/pagination";
import { downloadCsv } from "@/lib/csv";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { decideRequest } from "@/lib/store/slices/staff-approvals-slice";

const FILTERS = {
  q: "",
  department: "all",
  office: "all",
  page: 1,
};

export function useStaffApprovals() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector((state) => state.staffApprovals.queue);
  const approvedToday = useAppSelector((state) => state.staffApprovals.approvedToday);
  const { filters, setFilters, resetFilters } = useQueryFilters(FILTERS);

  const filtered = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return queue.filter((staff) => {
      const matchesQuery =
        needle.length === 0 ||
        staff.name.toLowerCase().includes(needle) ||
        staff.staffId.toLowerCase().includes(needle);
      const matchesDepartment =
        filters.department === "all" || staff.department === filters.department;
      const matchesOffice = filters.office === "all" || staff.office === filters.office;
      return matchesQuery && matchesDepartment && matchesOffice;
    });
  }, [filters.department, filters.office, filters.q, queue]);

  const page = paginate(filtered, filters.page, DEFAULT_PAGE_SIZE);

  const removeFromQueue = useCallback((id: string, action: "approve" | "reject") => {
    dispatch(decideRequest({ id, decision: action }));
  }, [dispatch]);

  const exportList = useCallback(() => {
    const header = "Name,Staff ID,Department,Office,Registered On,Registered At";
    const rows = filtered.map(
      (staff) =>
        `"${staff.name}","${staff.staffId}","${staff.department}","${staff.office}","${staff.registeredOn}","${staff.registeredAt}"`,
    );
    downloadCsv("registration-approvals.csv", [header, ...rows].join("\n"));
  }, [filtered]);

  return {
    queue,
    approvedToday,
    query: filters.q,
    department: filters.department,
    office: filters.office,
    setQuery: (q: string) => setFilters({ q }),
    setDepartment: (department: string) => setFilters({ department }),
    setOffice: (office: string) => setFilters({ office }),
    setPage: (page: number | ((current: number) => number)) =>
      setFilters({ page: typeof page === "function" ? page(filters.page) : page }),
    resetFilters,
    filtered,
    visible: page.rows,
    currentPage: page.currentPage,
    pageCount: page.pageCount,
    showingFrom: page.from,
    showingTo: page.to,
    removeFromQueue,
    exportList,
  };
}

export type { ApprovalRequest };

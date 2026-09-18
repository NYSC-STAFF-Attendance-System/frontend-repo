"use client";

import { useMemo } from "react";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  ANOMALY_COUNT,
  reportStaff,
  type ReportPeriod,
} from "../_data";
import { downloadCsv } from "@/lib/csv";

const FILTERS = {
  period: "This Month",
  q: "",
  status: "All statuses",
  station: "All stations",
  anomalies: false,
  page: 1,
};

export function useReports() {
  const { filters, setFilters, resetFilters } = useQueryFilters(FILTERS);

  const filtered = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return reportStaff.filter((row) => {
      const matchesQuery =
        needle.length === 0 ||
        row.name.toLowerCase().includes(needle) ||
        row.staffId.toLowerCase().includes(needle);
      const matchesStatus = filters.status === "All statuses" || row.band === filters.status;
      const matchesStation =
        filters.station === "All stations" || row.station === filters.station;
      const matchesAnomaly = !filters.anomalies || row.band === "Deficient";
      return matchesQuery && matchesStatus && matchesStation && matchesAnomaly;
    });
  }, [filters.anomalies, filters.q, filters.station, filters.status]);

  function showAnomalies() {
    setFilters({ anomalies: true, status: "Deficient" });
  }

  function exportCsv() {
    const header = "Name,Staff ID,Station,Present,Expected,Score,Band,Avg In";
    const body = filtered.map((row) =>
      [
        row.name,
        row.staffId,
        row.station,
        row.present,
        row.expected,
        row.score,
        row.band,
        row.avgIn,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    downloadCsv("attendance-report.csv", [header, ...body].join("\n"));
  }

  return {
    period: filters.period as ReportPeriod,
    query: filters.q,
    status: filters.status,
    station: filters.station,
    anomaliesOnly: filters.anomalies,
    page: filters.page,
    filtered,
    anomalyCount: ANOMALY_COUNT,
    setPeriod: (period: string) => setFilters({ period }),
    setQuery: (q: string) => setFilters({ q }),
    setStatus: (status: string) => {
      setFilters({ status, anomalies: status === "Deficient" });
    },
    setStation: (station: string) => setFilters({ station }),
    setPage: (page: number | ((current: number) => number)) =>
      setFilters({ page: typeof page === "function" ? page(filters.page) : page }),
    showAnomalies,
    resetTable: () => resetFilters(),
    exportCsv,
  };
}

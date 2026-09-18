"use client";

import { useMemo } from "react";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { recentActivity } from "../_data";

const FILTERS = { tab: "all" };

export function useRecentActivity() {
  const { filters, setFilters } = useQueryFilters(FILTERS);
  const tab = filters.tab === "attendance" || filters.tab === "approvals" ? filters.tab : "all";

  const rows = useMemo(() => {
    if (tab === "all") return recentActivity;
    return recentActivity.filter((item) => item.category === tab);
  }, [tab]);

  return {
    tab,
    rows,
    setTab: (next: string) => setFilters({ tab: next }),
  };
}

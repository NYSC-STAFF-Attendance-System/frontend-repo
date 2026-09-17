"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { api } from "@/lib/api";
import type {
  AttendanceDay,
  AttendanceStatistics,
  HistoryPeriod,
  HistoryResult,
} from "@/types";

type State =
  | { name: "loading" }
  | { name: "error"; message: string }
  | { name: "ready"; days: AttendanceDay[]; statistics: AttendanceStatistics };

export const HISTORY_PERIODS: { value: Exclude<HistoryPeriod, "custom">; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
];

const FILTERS = {
  period: "this_month" as Exclude<HistoryPeriod, "custom">,
};

function toState(result: HistoryResult): State {
  if (result.kind === "success") {
    return { name: "ready", days: result.days, statistics: result.statistics };
  }
  return {
    name: "error",
    message:
      result.kind === "offline"
        ? "You appear to be offline. Your records are safe on the server."
        : result.message,
  };
}

export function useHistory() {
  const { filters, setFilters } = useQueryFilters(FILTERS);
  const period = filters.period as Exclude<HistoryPeriod, "custom">;
  const [state, setState] = useState<State>({ name: "loading" });

  const fetchPeriod = useCallback((next: Exclude<HistoryPeriod, "custom">) => {
    let active = true;
    api.attendance.history({ period: next }).then((result) => {
      if (!active) return;
      setState(toState(result));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => fetchPeriod(period), [fetchPeriod, period]);

  function selectPeriod(next: Exclude<HistoryPeriod, "custom">) {
    setState({ name: "loading" });
    setFilters({ period: next });
  }

  function retry() {
    setState({ name: "loading" });
    fetchPeriod(period);
  }

  return { period, state, selectPeriod, retry };
}

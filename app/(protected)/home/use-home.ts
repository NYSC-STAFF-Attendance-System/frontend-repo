"use client";

import { useCallback, useEffect, useState } from "react";
import { useStaff } from "@/hooks/use-staff";
import { api } from "@/lib/api";
import type { AttendanceDay, TodayProgress, TodayResult } from "@/types";

type State =
  | { name: "loading" }
  | { name: "error"; message: string }
  | { name: "ready"; date: string; day: AttendanceDay | null };

function toState(result: TodayResult): State {
  if (result.kind === "success") {
    return { name: "ready", date: result.date, day: result.day };
  }
  return {
    name: "error",
    message:
      result.kind === "offline"
        ? "You appear to be offline. Your attendance is still safe on the server."
        : result.message,
  };
}

export function progressOf(day: AttendanceDay | null): TodayProgress {
  if (!day?.signInAt) return "not_started";
  if (!day.signOutAt) return "signed_in";
  return "complete";
}

export function useHome() {
  const staff = useStaff();
  const [state, setState] = useState<State>({ name: "loading" });

  const fetchToday = useCallback(() => {
    let active = true;
    api.attendance.today().then((result) => {
      if (!active) return;
      setState(toState(result));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => fetchToday(), [fetchToday]);

  function retry() {
    setState({ name: "loading" });
    fetchToday();
  }

  return {
    staff,
    firstName: staff.fullName.split(" ")[0],
    state,
    retry,
  };
}

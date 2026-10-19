"use client";

import { useEffect, useState } from "react";
import { readAttendance } from "@/lib/admin/attendance-cache";
import { formatDayLabel, timeFromIso } from "@/lib/format";
import type { AdminAttendanceRow } from "@/types";

function statusText(status: string) {
  if (status === "signed_in") return "Signed in";
  if (status === "signed_out") return "Signed out";
  return status.replaceAll("_", " ");
}

function fieldsFor(row: AdminAttendanceRow) {
  return [
    ["Staff", row.staffName || "—"],
    ["Staff ID", row.staffId || "—"],
    ["Office", row.officeName || "—"],
    ["State", row.location || "—"],
    ["Date", row.date ? formatDayLabel(row.date) : "—"],
    ["Sign in", row.signInAt ? timeFromIso(row.signInAt) : "—"],
    ["Sign out", row.signOutAt ? timeFromIso(row.signOutAt) : "—"],
    ["Status", statusText(row.status)],
  ] as const;
}

/**
 * The attendance list is the only source for a row. This reads the row that
 * list already stored. There is no correction endpoint.
 */
export function useAttendanceRecord(id: string) {
  const [row, setRow] = useState<AdminAttendanceRow | null | undefined>(undefined);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRow(readAttendance(id));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [id]);

  if (row === undefined) {
    return { status: "loading" as const, title: "", fields: [] };
  }

  if (!row) {
    return { status: "missing" as const, title: "", fields: [] };
  }

  return {
    status: "ready" as const,
    title: row.staffName || "Attendance",
    fields: fieldsFor(row),
  };
}

import type { AdminAttendanceRow } from "@/types";

const CACHE_KEY = "nysc.admin.attendance.rows";

/**
 * The list endpoint is the only way to read a row. The detail page has no
 * get-by-id call, so the list leaves the rows here for that page to open.
 */
export function rememberAttendance(rows: AdminAttendanceRow[]): void {
  if (typeof window === "undefined") return;
  const current = readAll();
  for (const row of rows) {
    if (row.id) current[row.id] = row;
  }
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(current));
  } catch {
    // The detail page will ask the reader to go back to the list.
  }
}

export function readAttendance(id: string): AdminAttendanceRow | null {
  return readAll()[id] ?? null;
}

function readAll(): Record<string, AdminAttendanceRow> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AdminAttendanceRow>) : {};
  } catch {
    return {};
  }
}

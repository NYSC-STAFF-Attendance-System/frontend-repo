import type { AttendanceSettings } from "@/types";

/**
 * Attendance rules used only to describe the policy back to the user, for
 * example on an empty history screen. Never used to decide whether a given day
 * was late - every mock day below carries the status the server would have set.
 *
 * Assumed global until the backend confirms whether this is per-office.
 */
export const mockSettings: AttendanceSettings = {
  timezone: "Africa/Lagos",
  resumptionTime: "08:00",
  gracePeriodMinutes: 10,
};

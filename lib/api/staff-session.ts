import type { AttendanceDay, StaffProfile } from "@/types";

/**
 * Staff JWT from POST /api/staff/login/, kept apart from the dashboard session.
 *
 * Login returns the token and a few profile fields, and there is no "who am I"
 * endpoint to ask again later. So both are kept here, together, and a reload
 * restores them instead of signing the person out.
 *
 * There is no refresh token either. When the access token expires the session
 * is over and the person signs in again - readStaffSession() treats an expired
 * token exactly like a missing one.
 *
 * Separate from lib/device.ts on purpose: signing out clears this, never the
 * device binding.
 */

const SESSION_KEY = "nysc.staff.session";

export type StaffSession = {
  access: string;
  profile: StaffProfile;
};

export function readStaffSession(): StaffSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StaffSession>;
    if (!parsed.access || !parsed.profile) return null;
    if (isExpired(parsed.access)) {
      clearStaffSession();
      return null;
    }
    return { access: parsed.access, profile: parsed.profile };
  } catch {
    return null;
  }
}

export function writeStaffSession(session: StaffSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private browsing can refuse the write. The in-memory sign-in still works
    // until the tab closes.
  }
}

export function clearStaffSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Already unreachable.
  }
}

const DAYS_KEY = "nysc.staff.days";

/** Enough for the longest /history period, a month, with room to spare. */
const MAX_DAYS = 62;

/**
 * Attendance records the backend has returned to this browser, newest first.
 *
 * PROVISIONAL: there is no "today" or history endpoint for staff, so /home and
 * /history show these instead. They are the server's own records, so none is
 * ever wrong - but days can be missing, when the person signed in from another
 * browser or cleared site data. Kept apart from the session, and keyed by
 * staff ID, so signing out and back in keeps them.
 */
export function readDays(staffId: string): AttendanceDay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DAYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { staffId?: string; days?: AttendanceDay[] };
    return parsed.staffId === staffId && Array.isArray(parsed.days) ? parsed.days : [];
  } catch {
    return [];
  }
}

/** Adds a record, replacing the one for the same date - sign out updates sign in. */
export function rememberDay(staffId: string, day: AttendanceDay): void {
  if (typeof window === "undefined") return;
  const days = [day, ...readDays(staffId).filter((kept) => kept.date !== day.date)]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_DAYS);
  try {
    window.localStorage.setItem(DAYS_KEY, JSON.stringify({ staffId, days }));
  } catch {
    // Blocked site data. /home falls back to "not signed in yet".
  }
}

/**
 * Reads the exp claim without verifying the signature. Verifying is the
 * server's job; this only avoids sending a token it is certain to refuse. A
 * token without a readable exp is left for the server to judge.
 */
function isExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

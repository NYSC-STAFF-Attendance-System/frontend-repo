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

const LAST_DAY_KEY = "nysc.staff.last_day";

/**
 * The last attendance record the backend returned to this browser.
 *
 * PROVISIONAL: there is no "today" endpoint, so /home shows this instead. It
 * is the server's own record, so it is never wrong - but it can be missing,
 * when the person signed in from another browser or cleared site data. Kept
 * apart from the session, and keyed by staff ID, so signing out and back in on
 * the same day still shows the morning's sign-in.
 */
export function readLastDay(staffId: string): AttendanceDay | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_DAY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { staffId?: string; day?: AttendanceDay };
    return parsed.staffId === staffId && parsed.day ? parsed.day : null;
  } catch {
    return null;
  }
}

export function writeLastDay(staffId: string, day: AttendanceDay): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_DAY_KEY, JSON.stringify({ staffId, day }));
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

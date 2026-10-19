import type { StaffProfile } from "@/types";

/**
 * Dashboard JWT, kept apart from the mock staff session.
 *
 * localStorage, same reason as the demo session: a later tab (the printed QR
 * opens one) must still see that an admin is signed in. The staff app must
 * not send this token. See the request interceptor in the real client.
 */

const SESSION_KEY = "nysc.admin.session";

export type AdminRole = "superuser" | "office_admin";

export type AdminSession = {
  access: string;
  refresh: string;
  role: AdminRole;
  email: string;
  firstName: string;
  surname: string;
};

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (!parsed.access || !parsed.refresh) return null;
    if (parsed.role !== "superuser" && parsed.role !== "office_admin") return null;
    return {
      access: parsed.access,
      refresh: parsed.refresh,
      role: parsed.role,
      email: parsed.email ?? "",
      firstName: parsed.firstName ?? "",
      surname: parsed.surname ?? "",
    };
  } catch {
    return null;
  }
}

export function writeAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private browsing can refuse the write. The in-memory sign-in still works
    // until the tab closes.
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Already unreachable.
  }
}

type SessionEndedListener = () => void;

let sessionEndedListener: SessionEndedListener | null = null;

/** The store registers this so a rejected dashboard token can sign the admin out. */
export function onAdminSessionEnded(listener: SessionEndedListener): void {
  sessionEndedListener = listener;
}

/**
 * Drop the dashboard session after the server rejects the access token that
 * was just sent. A newer sign-in uses a different token and is left in place.
 */
export function expireAdminSession(rejectedAccess: string): void {
  const current = readAdminSession();
  if (!current || current.access !== rejectedAccess) return;
  clearAdminSession();
  sessionEndedListener?.();
}

/** The header and AdminGuard read a StaffProfile. Login does not return one. */
export function profileFromAdminSession(session: AdminSession): StaffProfile {
  const fullName = [session.firstName, session.surname].filter(Boolean).join(" ");
  return {
    staffId: "",
    fullName: fullName || session.email,
    email: session.email,
    rank: "",
    department: { id: "", name: "" },
    office: { id: "", name: "" },
    accountStatus: "active",
    role: session.role === "superuser" ? "super_admin" : "admin",
    emailVerified: true,
    deviceBoundAt: null,
  };
}

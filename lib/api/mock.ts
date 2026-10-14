import type { ApiClient } from "./types";
import type { AttendanceDay, AttendanceOutcome, ScanResolution } from "@/types";
import {
  MOCK_ADMIN_INVITE_TOKEN,
  MOCK_ADMIN_PASSWORD,
  MOCK_ROTATED_TOKEN,
  defaultOfficeQrStation,
  isAdminRole,
  mockAccounts,
  mockAttendanceDays,
  mockAttendanceOutcomes,
  mockLookupResults,
  mockOffice,
  mockOfficeQrStation,
  mockScanResolutions,
  mockStaff,
  mockStatistics,
} from "@/lib/mock";
import type { StaffProfile, StaffRole } from "@/types";

/**
 * Mock implementation of ApiClient. Serves the fixtures in lib/mock with a
 * short delay so every screen has a real loading state to render.
 *
 * DEMO INPUTS - how to reach each branch while building:
 *
 *   login
 *     NYSC/FCT/0842 + any password 8 chars or more   staff success (not admin)
 *     i.bello@nysc.gov.ng + NyscAdmin1               verified admin -> /admin
 *     super.admin@nysc.gov.ng + NyscAdmin1           super admin -> /admin
 *     NYSC/FCT/0619 + any password                   account_banned
 *     any id + password "wrongdevice"                wrong_device
 *     any id + password "unverified"                 email_not_verified
 *     any id + password "offline"                    offline
 *     anything else                                  invalid_credentials
 *
 *   admin invite
 *     /invite-admin?token=admin_invite_ok            promotes Chinedu to admin
 *
 *   lookupStaffId
 *     NYSC/FCT/0842   found
 *     NYSC/FCT/0619   already_registered
 *     anything else   not_found
 *
 *   resolveToken
 *     current office QR token           resolved
 *     a rotated / previous token        invalid_token
 *     current token with scans off      office_inactive
 *
 *   submit
 *     Walks today forward: first call signs in, second signs out, third
 *     reports already_complete. Survives page loads and new tabs, so scanning
 *     the QR code continues the same day. Sign out to reset the demo.
 *
 *   forcing any other outcome
 *     Add ?force= to the /scan URL to get a specific verdict back, for example
 *     /scan?t=qr_fct_hq_9f2a7c&force=outside_geofence
 *     Use ?forceResolve= for the token-resolution phase instead.
 */

const DELAY_MS = 450;

const wait = (ms = DELAY_MS) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Dev-only override that lets any scan state be reached from the address bar.
 *
 * Several outcomes cannot be produced by driving the mock normally - there is
 * no way to stand outside a fictional geofence - and the alternative is editing
 * this file every time a state needs checking or demonstrating.
 *
 * Reading window.location directly is deliberate: it keeps the override inside
 * the mock, so no screen and no shared type carries a hook for it, and nothing
 * has to be unpicked when the real client takes over.
 */
function forced<T extends { kind: string }>(
  param: string,
  table: Record<string, T>,
): T | null {
  if (typeof window === "undefined") return null;
  const requested = new URLSearchParams(window.location.search).get(param);
  if (!requested) return null;
  return table[requested] ?? null;
}

/**
 * Demo state, kept in localStorage.
 *
 * localStorage, not sessionStorage, and the reason is the whole point of the
 * product: scanning the printed code opens the link in a NEW TAB. sessionStorage
 * is scoped to one tab, so the session established at login would be invisible
 * to the tab the camera opens, and the staff member would be bounced back to
 * the login form at exactly the moment the demo is meant to work.
 *
 * Cleared by logout. The real client will hold a token issued by the backend and
 * none of this survives.
 */
const SESSION_KEY = "nysc.mock.signedInStaffId";
const LEGACY_SESSION_KEY = "nysc.mock.signedIn";
const TODAY_KEY = "nysc.mock.today";
const ROLE_KEY = "nysc.mock.roleOverrides";
const INVITES_KEY = "nysc.mock.adminInvites";
const OFFICE_QR_KEY = "nysc.mock.officeQr";

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Private browsing and blocked site data both throw. The demo degrades to
    // in-memory behaviour rather than failing.
    return fallback;
  }
}

function writeStore(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing to do; the value was unreachable anyway.
  }
}

/** Today's record as the demo progresses. Null until the first sign in. */
function getToday(): AttendanceDay | null {
  return readStore<AttendanceDay | null>(TODAY_KEY, null);
}

function setToday(day: AttendanceDay | null): void {
  writeStore(TODAY_KEY, day);
}

function roleOverrides(): Record<string, StaffRole> {
  return readStore<Record<string, StaffRole>>(ROLE_KEY, {});
}

function withRole(profile: StaffProfile): StaffProfile {
  return { ...profile, role: roleOverrides()[profile.staffId] ?? profile.role };
}

function findAccount(staffIdOrEmail: string): StaffProfile | undefined {
  const needle = staffIdOrEmail.trim().toLowerCase();
  return mockAccounts.find(
    (account) =>
      account.staffId.toLowerCase() === needle ||
      account.email.toLowerCase() === needle,
  );
}

function currentProfile(): StaffProfile | null {
  const id = readStore<string | null>(SESSION_KEY, null);
  if (id) {
    const match = mockAccounts.find((account) => account.staffId === id);
    return match ? withRole(match) : null;
  }
  // Older sessions only stored a boolean. Treat that as the staff fixture.
  if (readStore<boolean>(LEGACY_SESSION_KEY, false)) {
    return withRole(mockStaff);
  }
  return null;
}

function setSignedInStaffId(staffId: string | null): void {
  writeStore(SESSION_KEY, staffId);
  writeStore(LEGACY_SESSION_KEY, Boolean(staffId));
}

type StoredOfficeQr = {
  token: string;
  previousTokens: string[];
  acceptingScans: boolean;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
};

function officeQrStore(): StoredOfficeQr {
  const fallback = defaultOfficeQrStation();
  return readStore<StoredOfficeQr>(OFFICE_QR_KEY, {
    token: fallback.token,
    previousTokens: [MOCK_ROTATED_TOKEN],
    acceptingScans: fallback.acceptingScans,
    lastUpdatedAt: fallback.lastUpdatedAt,
    lastUpdatedBy: fallback.lastUpdatedBy,
  });
}

function stationFromStore(stored: StoredOfficeQr) {
  return mockOfficeQrStation(stored);
}

function writeOfficeQr(next: StoredOfficeQr) {
  const actor = currentProfile();
  const stamped: StoredOfficeQr = {
    ...next,
    lastUpdatedBy: actor
      ? `${actor.fullName} (${actor.role === "super_admin" ? "Super Admin" : "Office Admin"})`
      : next.lastUpdatedBy,
  };
  writeStore(OFFICE_QR_KEY, stamped);
  return stationFromStore(stamped);
}

function nowLabel() {
  const now = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mer = now.getHours() >= 12 ? "PM" : "AM";
  const hour = now.getHours() % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} · ${String(hour).padStart(2, "0")}:${minutes} ${mer}`;
}

function requireAdminQr() {
  const actor = currentProfile();
  if (!actor || !isAdminRole(actor.role)) return { kind: "forbidden" as const };
  return null;
}

function buildSignIn(): AttendanceDay {
  return {
    id: "att_today",
    date: "2026-09-16",
    signInAt: "2026-09-16T07:52:00+01:00",
    signOutAt: null,
    status: "present",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  };
}

export const mockApi: ApiClient = {
  auth: {
    async login({ staffIdOrEmail, password }) {
      await wait();

      if (password === "offline") return { kind: "offline" };
      if (password === "wrongdevice") return { kind: "wrong_device" };
      if (password === "unverified") {
        return { kind: "email_not_verified", email: mockStaff.email };
      }

      const account = findAccount(staffIdOrEmail);
      if (!account) return { kind: "invalid_credentials" };
      if (account.accountStatus === "banned") return { kind: "account_banned" };

      const profile = withRole(account);
      const usedEmail = staffIdOrEmail.includes("@");

      // Email + admin password opens the dashboard. Staff ID (any 8+ chars)
      // stays on the attendance app, even after the same person is invited.
      if (usedEmail && isAdminRole(profile.role)) {
        if (password !== MOCK_ADMIN_PASSWORD) return { kind: "invalid_credentials" };
      } else if (password.length < 8) {
        return { kind: "invalid_credentials" };
      }

      setSignedInStaffId(profile.staffId);
      return { kind: "success", staff: profile };
    },

    async logout() {
      await wait(150);
      setSignedInStaffId(null);
      setToday(null);
    },

    async getProfile() {
      await wait(200);
      return currentProfile();
    },
  },

  admin: {
    async inviteAdmin(email) {
      await wait();
      const actor = currentProfile();
      if (!actor || actor.role !== "super_admin") return { kind: "forbidden" };

      const target = findAccount(email);
      if (!target || target.role === "super_admin") return { kind: "not_staff" };
      if (isAdminRole(withRole(target).role)) return { kind: "already_admin" };

      const token = `invite_${target.staffId.replaceAll("/", "_")}`;
      const invites = readStore<Record<string, string>>(INVITES_KEY, {});
      invites[token] = target.staffId;
      writeStore(INVITES_KEY, invites);

      const origin = typeof window === "undefined" ? "" : window.location.origin;
      return {
        kind: "sent",
        email: target.email,
        inviteUrl: `${origin}/invite-admin?token=${token}`,
      };
    },

    async verifyAdminInvite(token) {
      await wait();
      if (!token) return { kind: "invalid_token" };
      if (token === "expired") return { kind: "expired_token" };

      const invites = readStore<Record<string, string>>(INVITES_KEY, {});
      const staffId =
        token === MOCK_ADMIN_INVITE_TOKEN ? mockStaff.staffId : invites[token];
      if (!staffId) return { kind: "invalid_token" };

      const account = mockAccounts.find((item) => item.staffId === staffId);
      if (!account) return { kind: "invalid_token" };

      const current = withRole(account);
      if (!isAdminRole(current.role)) {
        writeStore(ROLE_KEY, { ...roleOverrides(), [staffId]: "admin" });
      }
      // Keep the token. React Strict Mode calls this twice; deleting it would
      // make the second call look like an invalid link.
      return { kind: "verified", email: account.email };
    },

    async getOfficeQr() {
      await wait(200);
      return { kind: "success", station: stationFromStore(officeQrStore()) };
    },

    async setOfficeQrAccepting(accepting) {
      await wait();
      const denied = requireAdminQr();
      if (denied) return denied;
      const stored = officeQrStore();
      return {
        kind: "success",
        station: writeOfficeQr({
          ...stored,
          acceptingScans: accepting,
          lastUpdatedAt: nowLabel(),
        }),
      };
    },

    async regenerateOfficeQr() {
      await wait();
      const denied = requireAdminQr();
      if (denied) return denied;
      const stored = officeQrStore();
      const token = `qr_fct_hq_${Math.random().toString(36).slice(2, 8)}`;
      return {
        kind: "success",
        station: writeOfficeQr({
          token,
          previousTokens: [...stored.previousTokens, stored.token],
          acceptingScans: true,
          lastUpdatedAt: nowLabel(),
          lastUpdatedBy: stored.lastUpdatedBy,
        }),
      };
    },
  },

  registration: {
    async lookupStaffId(staffId) {
      await wait();
      const match = mockLookupResults.find(
        (entry) => entry.staffId.toLowerCase() === staffId.trim().toLowerCase(),
      );
      if (!match) return { kind: "not_found" };
      return match.alreadyRegistered
        ? { kind: "already_registered", staff: match }
        : { kind: "found", staff: match };
    },

    async register({ email, password }) {
      await wait();
      if (password.length < 8) {
        return {
          kind: "invalid_details",
          fieldErrors: { password: "Use at least 8 characters." },
        };
      }
      return { kind: "success", email };
    },

    async verifyEmail(token) {
      await wait();
      if (!token) return { kind: "invalid_token" };
      if (token === "expired") return { kind: "expired_token" };
      if (token === "used") return { kind: "already_verified" };
      return { kind: "verified" };
    },

    async resendVerification() {
      await wait();
      return { kind: "sent" };
    },
  },

  password: {
    async requestReset() {
      await wait();
      // Always "sent", whether or not the address exists. Confirming which
      // addresses are registered would turn this form into a staff directory.
      return { kind: "sent" };
    },

    async reset({ token, password }) {
      await wait();
      if (token === "expired") return { kind: "expired_token" };
      if (!token) return { kind: "invalid_token" };
      if (password.length < 8) {
        return { kind: "weak_password", message: "Use at least 8 characters." };
      }
      return { kind: "success" };
    },

    async change({ currentPassword, newPassword }) {
      await wait();
      if (currentPassword.length < 8) return { kind: "wrong_current_password" };
      if (newPassword.length < 8) {
        return { kind: "weak_password", message: "Use at least 8 characters." };
      }
      return { kind: "success" };
    },
  },

  attendance: {
    async resolveToken(token) {
      await wait(300);

      const override = forced<ScanResolution>("forceResolve", mockScanResolutions);
      if (override) return override;

      const qr = officeQrStore();
      if (token === qr.token) {
        if (!qr.acceptingScans) {
          return {
            kind: "error",
            message: "This station is not accepting scans right now. Ask your office admin.",
          };
        }
        return { kind: "resolved", office: mockOffice };
      }
      return { kind: "invalid_token" };
    },

    async submit({ token }) {
      await wait();

      const override = forced<AttendanceOutcome>("force", mockAttendanceOutcomes);
      if (override) return override;

      const qr = officeQrStore();
      if (token !== qr.token) return { kind: "invalid_token" };
      if (!qr.acceptingScans) return { kind: "office_inactive" };

      const current = getToday();

      if (current === null) {
        const created = buildSignIn();
        setToday(created);
        return { kind: "signed_in", day: created };
      }

      if (current.signOutAt === null) {
        // Annotated, not inferred: without it "checked_out" widens to string
        // and stops matching AttendanceStatus.
        const completed: AttendanceDay = {
          ...current,
          signOutAt: "2026-09-16T16:08:00+01:00",
          status: "checked_out",
        };
        setToday(completed);
        return { kind: "signed_out", day: completed };
      }

      return { kind: "already_complete", day: current };
    },

    async today() {
      await wait(250);
      // Fixed date for the whole prototype, matching the fixtures. In the real
      // system this is the server saying what "today" is in Africa/Lagos.
      return { kind: "success", date: "2026-09-16", day: getToday() };
    },

    async history() {
      await wait();
      return { kind: "success", days: mockAttendanceDays, statistics: mockStatistics };
    },
  },
};

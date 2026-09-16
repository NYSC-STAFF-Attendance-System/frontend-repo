import type { ApiClient } from "./types";
import type { AttendanceDay, AttendanceOutcome, ScanResolution } from "@/types";
import {
  MOCK_ROTATED_TOKEN,
  MOCK_VALID_TOKEN,
  mockAttendanceDays,
  mockAttendanceOutcomes,
  mockBannedStaff,
  mockLookupResults,
  mockOffice,
  mockScanResolutions,
  mockStaff,
  mockStatistics,
} from "@/lib/mock";

/**
 * Mock implementation of ApiClient. Serves the fixtures in lib/mock with a
 * short delay so every screen has a real loading state to render.
 *
 * DEMO INPUTS - how to reach each branch while building:
 *
 *   login
 *     NYSC/FCT/0842 + any password 8 chars or more   success
 *     NYSC/FCT/0619 + any password                   account_banned
 *     any id + password "wrongdevice"                wrong_device
 *     any id + password "unverified"                 email_not_verified
 *     any id + password "offline"                    offline
 *     anything else                                  invalid_credentials
 *
 *   lookupStaffId
 *     NYSC/FCT/0842   found
 *     NYSC/FCT/0619   already_registered
 *     anything else   not_found
 *
 *   resolveToken
 *     the value of MOCK_VALID_TOKEN     resolved
 *     anything else                     invalid_token
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
const SESSION_KEY = "nysc.mock.signedIn";
const TODAY_KEY = "nysc.mock.today";

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

/** Whether the mock considers someone signed in. Cleared by logout. */
function isSignedIn(): boolean {
  return readStore<boolean>(SESSION_KEY, false);
}

function setSignedIn(value: boolean): void {
  writeStore(SESSION_KEY, value);
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

      const matchesBanned =
        staffIdOrEmail === mockBannedStaff.staffId ||
        staffIdOrEmail === mockBannedStaff.email;
      if (matchesBanned) return { kind: "account_banned" };

      const matchesStaff =
        staffIdOrEmail === mockStaff.staffId || staffIdOrEmail === mockStaff.email;
      if (matchesStaff && password.length >= 8) {
        setSignedIn(true);
        return { kind: "success", staff: mockStaff };
      }

      return { kind: "invalid_credentials" };
    },

    async logout() {
      await wait(150);
      setSignedIn(false);
      setToday(null);
    },

    async getProfile() {
      await wait(200);
      return isSignedIn() ? mockStaff : null;
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

      if (token === MOCK_VALID_TOKEN) return { kind: "resolved", office: mockOffice };
      if (token === MOCK_ROTATED_TOKEN) return { kind: "invalid_token" };
      return { kind: "invalid_token" };
    },

    async submit({ token }) {
      await wait();

      const override = forced<AttendanceOutcome>("force", mockAttendanceOutcomes);
      if (override) return override;

      if (token !== MOCK_VALID_TOKEN) return { kind: "invalid_token" };

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

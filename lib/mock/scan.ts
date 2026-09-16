import type { AttendanceOutcome, LocationFailure, ScanResolution } from "@/types";
import { mockAttendanceDays } from "./attendance";
import { mockOffice } from "./office";

/** The token printed on the mock office poster. /scan reads this from ?t=. */
export const MOCK_VALID_TOKEN = "qr_fct_hq_9f2a7c";

/** A token that has been rotated since printing, for the invalid-token state. */
export const MOCK_ROTATED_TOKEN = "qr_fct_hq_0001aa";

const todaySignedIn = mockAttendanceDays[0];

/**
 * Every resolution the /scan page can get on load, keyed by kind.
 *
 * Exported as a map rather than a list so a dev-only switcher can force any
 * state by name while building the screen, instead of you having to break the
 * network to see the offline branch.
 */
export const mockScanResolutions: Record<ScanResolution["kind"], ScanResolution> = {
  resolved: { kind: "resolved", office: mockOffice },
  invalid_token: { kind: "invalid_token" },
  rate_limited: { kind: "rate_limited", retryAfterSeconds: 60 },
  offline: { kind: "offline" },
  error: { kind: "error", message: "Something went wrong. Please try again." },
};

/** Every reason the browser can refuse to give us coordinates. */
export const mockLocationFailures: Record<LocationFailure["kind"], LocationFailure> = {
  permission_denied: { kind: "permission_denied" },
  timed_out: { kind: "timed_out" },
  unavailable: { kind: "unavailable" },
};

/**
 * Every verdict the backend can return once coordinates are submitted.
 *
 * signed_out reuses today's record with a sign-out time filled in, so the
 * success screen has a plausible pair of timestamps to show rather than two
 * unrelated fixtures.
 */
export const mockAttendanceOutcomes: Record<AttendanceOutcome["kind"], AttendanceOutcome> = {
  signed_in: { kind: "signed_in", day: todaySignedIn },
  signed_out: {
    kind: "signed_out",
    day: {
      ...todaySignedIn,
      signOutAt: "2026-09-16T16:08:00+01:00",
      status: "checked_out",
    },
  },
  outside_geofence: { kind: "outside_geofence" },
  already_complete: {
    kind: "already_complete",
    day: {
      ...todaySignedIn,
      signOutAt: "2026-09-16T16:08:00+01:00",
      status: "checked_out",
    },
  },
  wrong_device: { kind: "wrong_device" },
  account_banned: { kind: "account_banned" },
  office_inactive: { kind: "office_inactive" },
  invalid_token: { kind: "invalid_token" },
  rate_limited: { kind: "rate_limited", retryAfterSeconds: 60 },
  offline: { kind: "offline" },
  error: { kind: "error", message: "Something went wrong. Please try again." },
};


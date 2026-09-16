import type { AttendanceDay } from "./attendance";
import type { Office } from "./office";

/**
 * Result of resolving the ?t= token in the /scan URL into an office.
 *
 * This runs on page load, before any location is requested. Splitting it from
 * the attendance attempt matters: a dead token or a dead office should be shown
 * immediately, without ever prompting the staff member for GPS.
 */
export type ScanResolution =
  | { kind: "resolved"; office: Office }
  /** Unknown token, or a token rotated since the poster was printed. */
  | { kind: "invalid_token" }
  | { kind: "rate_limited"; retryAfterSeconds: number | null }
  | { kind: "offline" }
  | { kind: "error"; message: string };

/**
 * Why the browser could not give us coordinates.
 *
 * These never reach the server - they happen on the device, before any request
 * is made. Kept separate from AttendanceOutcome for exactly that reason: a
 * denied permission is not a decision the backend made about this person.
 */
export type LocationFailure =
  | { kind: "permission_denied" }
  | { kind: "timed_out" }
  | { kind: "unavailable" };

/**
 * What the backend decided when attendance was submitted with coordinates.
 *
 * The order the server checks these in is fixed: resolve office, office active,
 * inside the fence, staff active, device matches, then whether today is already
 * done. Only one of these ever comes back.
 */
export type AttendanceOutcome =
  | { kind: "signed_in"; day: AttendanceDay }
  | { kind: "signed_out"; day: AttendanceDay }
  /** Too far from the office. Nothing is recorded. */
  | { kind: "outside_geofence" }
  /** Both sign-in and sign-out already exist for today. */
  | { kind: "already_complete"; day: AttendanceDay }
  /** Right credentials, wrong phone. Only an admin can reset the binding. */
  | { kind: "wrong_device" }
  | { kind: "account_banned" }
  | { kind: "office_inactive" }
  /** The token was rotated between page load and the button tap. */
  | { kind: "invalid_token" }
  | { kind: "rate_limited"; retryAfterSeconds: number | null }
  | { kind: "offline" }
  | { kind: "error"; message: string };

/**
 * Coordinates handed to the backend. Sent, never judged locally.
 */
export type Coordinates = {
  latitude: number;
  longitude: number;
  /** Metres, as reported by the browser. Useful for support, not for deciding. */
  accuracy: number;
};

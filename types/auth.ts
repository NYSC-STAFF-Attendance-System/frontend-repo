import type { AttendanceDay, AttendanceStatistics } from "./attendance";
import type { StaffLookupResult, StaffProfile } from "./staff";

/**
 * Every result type in this file is a discriminated union for the same reason
 * the /scan outcomes are: a screen must handle each branch explicitly, and the
 * data that only exists on some branches cannot be read on the others.
 */

export type LoginResult =
  | { kind: "success"; staff: StaffProfile }
  | { kind: "invalid_credentials" }
  /** Right password, phone that is not the bound one. Only an admin can reset. */
  | { kind: "wrong_device" }
  | { kind: "account_banned" }
  | { kind: "email_not_verified"; email: string }
  | { kind: "rate_limited"; retryAfterSeconds: number | null }
  | { kind: "offline" }
  | { kind: "error"; message: string };

/** Step one of /register: does this staff ID exist and is it still unclaimed? */
export type StaffLookupOutcome =
  | { kind: "found"; staff: StaffLookupResult }
  | { kind: "not_found" }
  | { kind: "already_registered"; staff: StaffLookupResult }
  | { kind: "offline" }
  | { kind: "error"; message: string };

export type RegisterResult =
  /** Carries the email so /verify-email can say where the link was sent. */
  | { kind: "success"; email: string }
  | { kind: "already_registered" }
  /** Keyed by form field name, so each message lands under its own input. */
  | { kind: "invalid_details"; fieldErrors: Record<string, string> }
  | { kind: "offline" }
  | { kind: "error"; message: string };

export type VerifyEmailResult =
  | { kind: "verified" }
  | { kind: "invalid_token" }
  | { kind: "expired_token" }
  /** Following the link twice is not an error worth alarming anyone about. */
  | { kind: "already_verified" }
  | { kind: "offline" }
  | { kind: "error"; message: string };

/** Super admin invites an existing staff member to the admin dashboard. */
export type InviteAdminResult =
  | { kind: "sent"; email: string; inviteUrl: string }
  | { kind: "not_staff" }
  | { kind: "already_admin" }
  | { kind: "forbidden" }
  | { kind: "offline" }
  | { kind: "error"; message: string };

export type VerifyAdminInviteResult =
  | { kind: "verified"; email: string }
  | { kind: "invalid_token" }
  | { kind: "expired_token" }
  | { kind: "already_verified" }
  | { kind: "offline" }
  | { kind: "error"; message: string };

/**
 * Requesting a reset link.
 *
 * There is no "no such account" branch on purpose. Telling an anonymous visitor
 * whether an address is registered turns this form into a way to discover who
 * works here. The screen says "if that address is registered, we have sent a
 * link" either way.
 */
export type PasswordResetRequestResult =
  | { kind: "sent" }
  | { kind: "rate_limited"; retryAfterSeconds: number | null }
  | { kind: "offline" }
  | { kind: "error"; message: string };

export type ResetPasswordResult =
  | { kind: "success" }
  | { kind: "invalid_token" }
  | { kind: "expired_token" }
  | { kind: "weak_password"; message: string }
  | { kind: "offline" }
  | { kind: "error"; message: string };

export type ChangePasswordResult =
  | { kind: "success" }
  | { kind: "wrong_current_password" }
  | { kind: "weak_password"; message: string }
  | { kind: "offline" }
  | { kind: "error"; message: string };

/**
 * /home needs today's row, which may legitimately not exist yet.
 *
 * date is returned alongside it, and is always present even when day is null.
 * The alternative is the phone working out what "today" is, and a phone in the
 * wrong timezone would disagree with the server about which day it is - most
 * visibly to someone signing in early in the morning.
 */
export type TodayResult =
  | { kind: "success"; date: string; day: AttendanceDay | null }
  | { kind: "offline" }
  | { kind: "error"; message: string };

/** /history returns the rows and the figures together, in one call. */
export type HistoryResult =
  | { kind: "success"; days: AttendanceDay[]; statistics: AttendanceStatistics }
  | { kind: "offline" }
  | { kind: "error"; message: string };

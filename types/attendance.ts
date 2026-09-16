/**
 * The two things a staff member can do at an office.
 */
export type AttendanceAction = "sign_in" | "sign_out";

/**
 * The state of a single day's record, as decided by the backend.
 *
 * FIELD VALUES UNCONFIRMED - the PRD names these five statuses in prose but
 * does not give their wire values. Assumed lower snake_case here. If the API
 * returns "CHECKED_OUT" or "Checked Out" this union is the only place to change.
 *
 * Meanings, from the PRD:
 *   present      signed in within the resumption time plus grace
 *   late         signed in after that
 *   absent       no sign-in once the attendance window has closed
 *   checked_out  the day was completed with both a sign-in and a sign-out
 *   incomplete   signed in but never signed out
 */
export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "checked_out"
  | "incomplete";

/**
 * One calendar day for one staff member, where "day" means a day in
 * Africa/Lagos as the backend defines it.
 *
 * Timestamps are ISO strings exactly as the server sent them, deliberately not
 * converted to Date objects here: a Date is interpreted in the phone's own
 * timezone, and the phone's clock is the one thing this product does not trust.
 *
 * status and minutesLate are both server calculations. The frontend never
 * compares signInAt against a resumption time to work out lateness for itself -
 * that rule lives on the backend, is configurable there, and would drift the
 * moment two places implemented it.
 */
export type AttendanceDay = {
  id: string;
  /** Calendar date in Africa/Lagos, formatted YYYY-MM-DD. */
  date: string;
  signInAt: string | null;
  signOutAt: string | null;
  status: AttendanceStatus;
  /**
   * How many minutes past the allowed arrival time the sign-in was, as
   * calculated by the server. Null when the day is not late, or when there is
   * no sign-in to measure. Renders as the "+25m" marker on /history.
   */
  minutesLate: number | null;
  officeId: string;
  officeName: string;
};

/**
 * What the staff member can do right now, shown on /home.
 *
 * Derived on the frontend from whether today's two timestamps have arrived -
 * no timestamp, one, or both. This is a question about which button to show,
 * not a judgement about the record, so it is kept separate from
 * AttendanceStatus and never sent to or received from the server.
 */
export type TodayProgress = "not_started" | "signed_in" | "complete";

/**
 * Aggregated attendance figures for one staff member over a date range,
 * shown on /history.
 *
 * Every number here is calculated by the backend. The frontend does not sum
 * days, does not work out a percentage, and does not average times - it asks
 * for a period and renders what comes back. Two implementations of the same
 * arithmetic would eventually disagree, and the server's answer is the one
 * that appears in admin reports.
 */
export type AttendanceStatistics = {
  /** Inclusive range the figures cover, YYYY-MM-DD in Africa/Lagos. */
  periodStart: string;
  periodEnd: string;
  daysPresent: number;
  daysAbsent: number;
  lateArrivals: number;
  earlyDepartures: number;
  /** Whole percentage, 0-100, server-calculated. */
  attendancePercentage: number;
  /** Local wall-clock "HH:mm", or null when there is nothing to average. */
  averageArrivalTime: string | null;
  averageDepartureTime: string | null;
  consecutiveDaysPresent: number;
};

/**
 * The preset ranges offered by the /history filter, matching the Stitch design.
 * "custom" opens a date range picker.
 */
export type HistoryPeriod = "today" | "this_week" | "this_month" | "custom";

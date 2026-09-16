/**
 * Attendance rules the UI may need in order to explain itself to staff, for
 * example "resumption is 08:00 with 10 minutes' grace" on an empty history.
 *
 * UNCONFIRMED WITH BACKEND - do not build a screen against this yet.
 * The phased build plan describes a single global AttendanceSettings record
 * holding default radius and timezone, and never mentions resumption time. The
 * PRD says resumption time and grace period are "configurable by the
 * administrator" without saying at what level. This type assumes global. If it
 * turns out to be per-office, it collapses into Office and every screen reading
 * it changes.
 *
 * Nothing in this type is ever used to decide whether someone was late. That
 * decision belongs to the server. These fields exist only to describe the rule
 * back to the user.
 */
export type AttendanceSettings = {
  /** IANA name, e.g. "Africa/Lagos". */
  timezone: string;
  /** Local wall-clock time, 24-hour, e.g. "08:00". */
  resumptionTime: string;
  gracePeriodMinutes: number;
};

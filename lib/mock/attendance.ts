import type { AttendanceDay, AttendanceStatistics } from "@/types";
import { mockOffice } from "./office";

/**
 * Two working weeks of attendance for the mock staff member, newest first.
 * "Today" in this prototype is Wednesday 16 September 2026.
 *
 * Every status in the union appears at least once so each row variant on
 * /history can be built against real data rather than a placeholder:
 *   present      today, signed in, not yet signed out
 *   checked_out  a completed on-time day
 *   late         signed in after resumption plus grace
 *   incomplete   signed in, day closed with no sign-out
 *   absent       no sign-in at all
 *
 * ASSUMPTION, needs backend confirmation: when a day is both late and
 * completed, status stays "late" rather than becoming "checked_out", because
 * lateness is the fact admin reports filter on. minutesLate is measured from
 * the resumption time (08:00), not from the end of the grace period - an 08:25
 * arrival is +25, which is what the design showed.
 *
 * Timestamps carry the +01:00 Africa/Lagos offset and are never parsed into a
 * Date in app code.
 */
export const mockAttendanceDays: AttendanceDay[] = [
  {
    id: "att_20260916",
    date: "2026-09-16",
    signInAt: "2026-09-16T07:52:00+01:00",
    signOutAt: null,
    status: "present",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260915",
    date: "2026-09-15",
    signInAt: "2026-09-15T07:48:00+01:00",
    signOutAt: "2026-09-15T16:05:00+01:00",
    status: "checked_out",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260914",
    date: "2026-09-14",
    signInAt: "2026-09-14T08:25:00+01:00",
    signOutAt: "2026-09-14T16:30:00+01:00",
    status: "late",
    minutesLate: 25,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260911",
    date: "2026-09-11",
    signInAt: "2026-09-11T07:55:00+01:00",
    signOutAt: null,
    status: "incomplete",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260910",
    date: "2026-09-10",
    signInAt: "2026-09-10T07:50:00+01:00",
    signOutAt: "2026-09-10T16:10:00+01:00",
    status: "checked_out",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260909",
    date: "2026-09-09",
    signInAt: null,
    signOutAt: null,
    status: "absent",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260908",
    date: "2026-09-08",
    signInAt: "2026-09-08T08:02:00+01:00",
    signOutAt: "2026-09-08T16:00:00+01:00",
    status: "checked_out",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260907",
    date: "2026-09-07",
    signInAt: "2026-09-07T08:18:00+01:00",
    signOutAt: "2026-09-07T16:12:00+01:00",
    status: "late",
    minutesLate: 18,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260904",
    date: "2026-09-04",
    signInAt: "2026-09-04T07:45:00+01:00",
    signOutAt: "2026-09-04T16:20:00+01:00",
    status: "checked_out",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
  {
    id: "att_20260903",
    date: "2026-09-03",
    signInAt: "2026-09-03T07:58:00+01:00",
    signOutAt: "2026-09-03T16:02:00+01:00",
    status: "checked_out",
    minutesLate: null,
    officeId: mockOffice.id,
    officeName: mockOffice.name,
  },
];

/**
 * Figures for the same window as the days above, 3 to 16 September 2026.
 *
 * Deliberately consistent with that list: ten working days, nine with a
 * sign-in, one absent, two late, and a five-day present streak running back
 * from today to the absence on the 9th. Numbers that do not reconcile with the
 * rows beneath them are the fastest way to lose a reviewer's trust in a demo.
 *
 * All of these are server calculations in the real system. The frontend asks
 * for a period and renders the answer.
 */
export const mockStatistics: AttendanceStatistics = {
  periodStart: "2026-09-03",
  periodEnd: "2026-09-16",
  daysPresent: 9,
  daysAbsent: 1,
  lateArrivals: 2,
  earlyDepartures: 0,
  attendancePercentage: 90,
  averageArrivalTime: "07:59",
  averageDepartureTime: "16:11",
  consecutiveDaysPresent: 5,
};

/** An empty history, for building the empty state on /history. */
export const mockEmptyAttendance: AttendanceDay[] = [];

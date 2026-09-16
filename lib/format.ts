/**
 * Display helpers for server-supplied dates and times.
 *
 * The rule behind both functions: the device clock and the device timezone are
 * never allowed to change what a staff member sees. A timestamp the server sent
 * as 07:52 in Lagos must read 07:52 on a phone that thinks it is in London.
 */

/**
 * Pulls the wall-clock time out of a server timestamp.
 *
 * Deliberately a string slice rather than new Date(...).toLocaleTimeString().
 * Parsing into a Date re-expresses the instant in whatever timezone the phone
 * is set to, so a traveller, or a phone with the wrong region, would see a
 * different sign-in time than the one on the record.
 *
 *   "2026-09-16T07:52:00+01:00" -> "07:52"
 */
export function timeFromIso(iso: string): string {
  return iso.slice(11, 16);
}

/**
 * Turns a YYYY-MM-DD date into something readable.
 *
 *   "2026-09-16" -> "Wed 16 Sep"
 *
 * Date is used here only to work out the weekday, and it is pinned to UTC at
 * both ends so the result cannot shift by a day on a phone set east or west.
 */
export function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

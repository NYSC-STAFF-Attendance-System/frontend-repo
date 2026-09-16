/**
 * An office, as returned when a QR token is resolved by /scan and as attached
 * to a staff member's profile.
 *
 * Note what is absent: no coordinates, no radius. The backend owns the geofence
 * decision. The frontend sends lat/lng and renders the answer, and never holds
 * the numbers needed to second-guess it. A value the phone can read is a value
 * the phone's owner can change.
 */
export type Office = {
  id: string;
  name: string;
  /** Nigerian state, e.g. "FCT". Display and admin filtering only. */
  state: string;
  /** A deactivated office refuses attendance; /scan renders a dedicated state. */
  isActive: boolean;
};

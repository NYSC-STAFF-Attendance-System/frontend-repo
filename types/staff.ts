import type { Department } from "./department";

/**
 * Whether the account may be used at all. A banned account can neither log in
 * nor record attendance and is sent to /blocked. Historical attendance is kept.
 */
export type AccountStatus = "active" | "banned";

/**
 * A staff member's own record, returned after they authenticate.
 * Used on /home, /profile, /history and the final step of /register.
 */
export type StaffProfile = {
  staffId: string;
  fullName: string;
  email: string;
  rank: string;
  department: Department;
  office: {
    id: string;
    name: string;
  };
  accountStatus: AccountStatus;
  emailVerified: boolean;
  /**
   * ISO timestamp from the server, or null if no phone is bound yet.
   * Staff cannot change this themselves; only an admin can reset the binding.
   */
  deviceBoundAt: string | null;
};

/**
 * What step one of /register returns when a staff ID is found.
 *
 * Deliberately thinner than StaffProfile. This is shown on a public page to
 * someone who has not proved who they are, so it carries only enough for the
 * right person to recognise themselves, and nothing worth harvesting by typing
 * staff IDs into the box.
 */
export type StaffLookupResult = {
  staffId: string;
  fullName: string;
  officeName: string;
  /** True if this record has already been claimed, so registration stops here. */
  alreadyRegistered: boolean;
};

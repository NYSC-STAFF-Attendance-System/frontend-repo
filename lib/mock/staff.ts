import type { StaffLookupResult, StaffProfile } from "@/types";
import { mockDepartments, mockOffice } from "./office";

/**
 * The signed-in staff member for the whole prototype. Every protected screen
 * renders this person.
 */
export const mockStaff: StaffProfile = {
  staffId: "NYSC/FCT/0842",
  fullName: "Chinedu Ibrahim",
  email: "c.ibrahim@nysc.gov.ng",
  rank: "Senior Officer II",
  department: mockDepartments[0],
  office: { id: mockOffice.id, name: mockOffice.name },
  accountStatus: "active",
  emailVerified: true,
  deviceBoundAt: "2026-08-03T09:14:00+01:00",
};

/**
 * A banned account, for building /blocked and the wrong-account states without
 * mutating the main fixture.
 */
export const mockBannedStaff: StaffProfile = {
  ...mockStaff,
  staffId: "NYSC/FCT/0619",
  fullName: "Amina Bello",
  email: "a.bello@nysc.gov.ng",
  accountStatus: "banned",
};

/**
 * Staff records an admin has created but nobody has claimed yet. Step one of
 * /register looks up against this list.
 *
 * Note the deliberate second entry: a record that has already been claimed, so
 * the "this staff ID is already registered" branch has something to hit.
 */
export const mockLookupResults: StaffLookupResult[] = [
  {
    staffId: "NYSC/FCT/0842",
    fullName: "Chinedu Ibrahim",
    officeName: mockOffice.name,
    alreadyRegistered: false,
  },
  {
    staffId: "NYSC/FCT/0619",
    fullName: "Amina Bello",
    officeName: mockOffice.name,
    alreadyRegistered: true,
  },
];
